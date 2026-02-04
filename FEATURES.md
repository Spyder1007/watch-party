# Watch Party - Feature Documentation

## 📹 Video Conferencing Features

### Multi-Party Video Calling
- Support for unlimited participants (limited by bandwidth)
- Real-time video streaming using WebRTC
- Automatic quality adjustment based on connection
- Low-latency peer-to-peer connections
- Graceful fallback with STUN servers

### Audio Communication
- Crystal-clear audio with opus codec optimization
- Independent audio control per participant
- Noise suppression available
- Echo cancellation built-in

### How It Works
1. User grants camera/microphone permissions
2. Local media stream is captured and displayed
3. WebSocket establishes connection to signaling server
4. Signaling server brokers peer connections
5. SimplePeer library manages WebRTC connections
6. Direct peer-to-peer connection established for each participant

---

## 🖥️ Screen Sharing

### Screen Share Capabilities
- Share entire screen or single application window
- Cursor visibility during share
- Seamless switching between camera and screen
- Smooth transitions without video interruption
- Works alongside audio/chat

### Technical Implementation
- Uses WebRTC's `getDisplayMedia()` API
- Replaces video track while maintaining audio connection
- Automatic fallback to camera when screen share ends
- All peers receive updated video stream

### Supported Browsers
- **Chrome/Chromium**: Full support
- **Firefox**: Full support  
- **Edge**: Full support
- **Safari**: Limited support (macOS 13+)

---

## 💬 Real-Time Chat

### Chat Features
- Instant message delivery to all room participants
- Message history from current session
- Timestamp for each message
- User identification for each message
- Character limit (200 chars per message)
- HTML entity escaping for security

### Message Flow
1. User types and sends message
2. Message sent via WebSocket to server
3. Server broadcasts to all participants in room
4. All clients receive and display message
5. Message persists in room for new joiners

### Chat Data Structure
```javascript
{
  userId: "unique-user-id",
  userName: "User Display Name",
  text: "Message content",
  timestamp: "2024-02-04T10:30:00.000Z"
}
```

---

## 👥 Participant Management

### Participant Features
- Real-time participant list
- Join/leave notifications
- User status indicators
- Automatic cleanup

### Participant Information
- User ID (unique identifier)
- User name (display name)
- Join timestamp
- Connection status

### Room Management
- Unique room IDs (UUID)
- Persistent message history
- Participant tracking
- Automatic room deletion when empty

---

## 🎮 User Controls

### Video/Audio Controls
| Control | Action | Shortcut |
|---------|--------|----------|
| Audio Button (🎤) | Toggle microphone | - |
| Video Button (📹) | Toggle camera | - |
| Screen Share (🖥️) | Share/stop screen | - |
| Leave Button (📞) | Exit room | - |

### Control States
- **Active** (Green): Feature enabled
- **Inactive** (Red): Feature disabled
- **Screen Sharing** (Highlighted): Active screen share

---

## 🔐 Security Features

### Built-In Security
- CORS enabled for cross-origin safety
- Input sanitization (HTML entity escaping)
- Message character limits
- User identity validation
- Connection state verification

### Recommendations
1. Use HTTPS/WSS in production
2. Implement rate limiting
3. Add user authentication
4. Add room access controls
5. Implement connection encryption

---

## 🌐 Network & Connectivity

### WebSocket Protocol
- Real-time bidirectional communication
- Low latency messaging
- Automatic reconnection support
- Event-based message handling

### STUN Servers
Configured servers for NAT traversal:
- stun:stun.l.google.com:19302
- stun:stun1.l.google.com:19302
- stun:stun2.l.google.com:19302

### Connection Types
- **Direct**: Peer-to-peer connection (ideal)
- **STUN**: Through STUN server
- **TURN**: Through relay server (for blocked networks)

---

## 📊 Room Architecture

### Room Storage
```javascript
{
  id: "room-uuid",
  participants: [
    {
      userId: "user-id",
      userName: "Display Name",
      joinedAt: "timestamp"
    }
  ],
  messages: [
    {
      userId: "user-id",
      userName: "Display Name",
      text: "Message",
      timestamp: "timestamp"
    }
  ],
  createdAt: "timestamp"
}
```

### Connection Management
- In-memory storage (can be replaced with database)
- Automatic cleanup of empty rooms
- Participant state tracking
- Message history persistence

---

## 🚀 Performance Optimization

### Current Optimizations
- Direct peer-to-peer connections (no server relay)
- WebSocket for efficient signaling
- Lazy loading of UI components
- CSS GPU acceleration with transforms
- Efficient DOM updates

### Potential Improvements
- Adaptive bitrate streaming
- Selective forwarding for large groups
- Hardware video encoding
- Connection quality indicators
- Bandwidth optimization

---

## 🐛 Error Handling

### Error Scenarios & Recovery
| Scenario | Handling |
|----------|----------|
| Camera access denied | User alert, app continues |
| Peer connection failed | Automatic retry with STUN |
| WebSocket disconnect | User notification |
| Room not found | Error page |
| Invalid user input | Input validation |

### Console Debugging
The app logs detailed information:
- WebSocket connection events
- Peer connection establishment
- Signal sending/receiving
- Error conditions

Enable by opening browser DevTools (F12)

---

## 📱 Responsive Design

### Breakpoints
- **Desktop** (> 1024px): Full layout with sidebar
- **Tablet** (768px - 1024px): Optimized grid
- **Mobile** (< 768px): Stacked layout

### Mobile Considerations
- Touch-friendly control buttons
- Optimized video grid
- Collapsible sidebar
- Portrait/landscape support

---

## 🔄 Event Flow

### Join Room Flow
```
1. User enters name and clicks "Create Room"
2. Frontend requests new room from server
3. Server creates room and returns room ID
4. Frontend navigates to room page
5. Browser requests camera/microphone access
6. Media stream obtained
7. WebSocket connection established
8. Client sends "join-room" message
9. Server broadcasts "user-joined" to all
10. Existing clients initiate peer connections
11. Video streams exchanged via WebRTC
```

### Message Send Flow
```
1. User types message and presses Enter/Send
2. Message sent via WebSocket to server
3. Server adds to room message history
4. Server broadcasts to all room clients
5. All clients update UI with new message
6. Message persists for new joiners
```

---

## 💾 Data Persistence

### Current State
- **Transient**: In-memory storage
- Resets when server restarts
- Room deleted when empty

### For Production
- Implement database (MongoDB/PostgreSQL)
- Store user accounts
- Archive rooms and chat history
- Analytics and logging

---

## 🎨 UI/UX Features

### User Interface
- Modern dark theme
- Gradient accents (Purple & Pink)
- Smooth animations and transitions
- Intuitive button states
- Clear visual feedback

### Accessibility
- Semantic HTML
- Color-coded status indicators
- Clear button labels
- Keyboard navigation support
- Screen reader friendly

---

## 📈 Scaling Considerations

### Current Limitations
- Best for small to medium groups (2-20 people)
- All connections peer-to-peer
- No bandwidth management

### For Scaling
1. Implement Selective Forwarding Unit (SFU)
2. Add bandwidth management
3. Implement tiering (presenter mode)
4. Use CDN for static assets
5. Database for persistence
6. Load balancing for multiple servers

---

## 🔧 Configuration & Customization

### Server Configuration
Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
```

### Client Configuration
Edit `app.js` CONFIG object:
```javascript
const CONFIG = {
  SERVER_URL: 'http://localhost:5000',
  WS_URL: 'ws://localhost:5000',
  STUN_SERVERS: [ /* ... */ ]
};
```

### Styling
Customize in `styles.css`:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #ec4899;
  /* ... */
}
```

---

## 📚 Additional Resources

### WebRTC Documentation
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC Samples](https://webrtc.github.io/samples/)

### SimplePeer Documentation
- [SimplePeer GitHub](https://github.com/feross/simple-peer)

### WebSocket
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

This documentation covers all current features and provides guidance for future enhancements!
