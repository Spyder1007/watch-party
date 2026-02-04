const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true
}));
app.use(express.json());

// Serve static files from client/public
app.use(express.static(path.join(__dirname, '../client/public')));

// In-memory storage for rooms and connections
const rooms = new Map();
const connections = new Map();

// HTTP endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.post('/api/rooms/create', (req, res) => {
  const roomId = uuidv4();
  rooms.set(roomId, {
    id: roomId,
    participants: [],
    createdAt: new Date(),
    messages: []
  });
  res.json({ roomId });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId: room.id,
    participants: room.participants,
    messageCount: room.messages.length
  });
});

// Serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  const userId = uuidv4();
  console.log(`New client connected: ${userId}`);

  connections.set(ws, { userId, roomId: null });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleWebSocketMessage(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${userId}`);
    handleUserDisconnect(ws);
    connections.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${userId}:`, error);
  });
});

function handleWebSocketMessage(ws, message) {
  const connection = connections.get(ws);
  if (!connection) return;

  switch (message.type) {
    case 'join-room':
      handleJoinRoom(ws, message);
      break;
    case 'leave-room':
      handleLeaveRoom(ws, message);
      break;
    case 'signal':
      handleSignal(ws, message);
      break;
    case 'chat':
      handleChatMessage(ws, message);
      break;
    case 'user-info':
      handleUserInfo(ws, message);
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

function handleJoinRoom(ws, message) {
  const { roomId, userName } = message;
  const connection = connections.get(ws);
  
  if (!connection) return;

  connection.roomId = roomId;
  connection.userName = userName;

  console.log(`User ${connection.userId} (${userName}) joining room ${roomId}`);

  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      participants: [],
      createdAt: new Date(),
      messages: []
    });
    console.log(`Created new room: ${roomId}`);
  }

  const room = rooms.get(roomId);
  const participant = {
    userId: connection.userId,
    userName: userName,
    joinedAt: new Date()
  };

  room.participants.push(participant);
  console.log(`Room ${roomId} now has ${room.participants.length} participants`);

  // Notify all users in room about new participant
  broadcastToRoom(roomId, {
    type: 'user-joined',
    userId: connection.userId,
    userName: userName,
    participants: room.participants
  }, ws);

  // Send current participants to new user
  ws.send(JSON.stringify({
    type: 'room-joined',
    roomId: roomId,
    userId: connection.userId,
    participants: room.participants,
    messages: room.messages
  }));
}

function handleLeaveRoom(ws, message) {
  const connection = connections.get(ws);
  if (!connection || !connection.roomId) return;

  const { roomId } = message;
  const room = rooms.get(roomId);

  if (room) {
    room.participants = room.participants.filter(p => p.userId !== connection.userId);
    
    broadcastToRoom(roomId, {
      type: 'user-left',
      userId: connection.userId,
      participants: room.participants
    });

    // Delete room if empty
    if (room.participants.length === 0) {
      rooms.delete(roomId);
    }
  }

  connection.roomId = null;
}

function handleSignal(ws, message) {
  const { to, signal } = message;
  const senderConnection = connections.get(ws);
  
  console.log(`Signal relaying: ${senderConnection.userId} -> ${to}, type: ${signal.type}`);
  
  // Find the recipient connection
  let found = false;
  for (const [clientWs, conn] of connections) {
    if (conn.userId === to && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'signal',
        from: senderConnection.userId,
        signal: signal
      }));
      console.log(`Signal relayed successfully to ${to}`);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.error(`Could not relay signal to ${to} - recipient not found or not connected`);
  }
}

function handleChatMessage(ws, message) {
  const connection = connections.get(ws);
  const { roomId, text } = message;

  if (!connection || !connection.roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  const chatMessage = {
    userId: connection.userId,
    userName: connection.userName,
    text: text,
    timestamp: new Date()
  };

  room.messages.push(chatMessage);

  broadcastToRoom(roomId, {
    type: 'chat',
    message: chatMessage
  });
}

function handleUserInfo(ws, message) {
  const connection = connections.get(ws);
  const { userName } = message;

  if (connection) {
    connection.userName = userName;
  }
}

function broadcastToRoom(roomId, message, excludeWs = null) {
  for (const [clientWs, conn] of connections) {
    if (conn.roomId === roomId && clientWs.readyState === WebSocket.OPEN) {
      if (excludeWs !== clientWs) {
        clientWs.send(JSON.stringify(message));
      }
    }
  }
}

function handleUserDisconnect(ws) {
  const connection = connections.get(ws);
  if (connection && connection.roomId) {
    handleLeaveRoom(ws, { roomId: connection.roomId });
  }
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Watch Party Server running on port ${PORT}`);
});
