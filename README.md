# Watch Party - A Real-time Video Chat & Screen Sharing Platform

A feature-rich web application that enables friends to watch content together, share screens, and communicate via video, audio, and chat.

## 🎯 Features

### Video & Audio
- Real-time video conferencing using WebRTC
- Audio communication between participants
- Toggle camera and microphone on/off
- Support for multiple participants

### Screen Sharing
- Share your screen with all participants
- Seamless switching between camera and screen
- Broadcast desktop content during watch parties

### Chat System
- Real-time messaging within watch party rooms
- Message history for each session
- Timestamp for each message

### Room Management
- Create unique watch party rooms
- Join existing rooms by room ID
- Participant list with online status
- Automatic cleanup when rooms are empty

## 🏗️ Project Structure

```
watchparty/
├── server/
│   ├── package.json
│   ├── server.js
│   └── .env
└── client/
    └── public/
        ├── index.html
        ├── styles.css
        ├── js/
        │   └── app.js
        └── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **CORS** - Cross-origin support
- **UUID** - Unique identifiers

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Core functionality
- **WebRTC** - Peer-to-peer video/audio
- **SimplePeer** - WebRTC wrapper library
- **WebSocket** - Real-time signaling

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support
- Camera and microphone for video/audio

## 🚀 Installation & Setup

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure Backend

Update `.env` file if needed:
```
PORT=5000
NODE_ENV=development
```

### 3. Start the Backend Server

```bash
npm start
```

The server will start on `http://localhost:5000`

### 4. Serve the Frontend

You can use any static server. Here are a few options:

#### Option A: Using Python
```bash
cd client/public
python -m http.server 8000
```

#### Option B: Using Node.js
```bash
cd client/public
npx http-server
```

#### Option C: Using VS Code Live Server Extension
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

The frontend will be available at `http://localhost:8000` (or port shown by your server)

## 🎮 Usage

### Creating a Watch Party

1. Open the application in your browser
2. Enter your name
3. Click "Create Room"
4. Share the Room ID with your friends

### Joining a Watch Party

1. Open the application in your browser
2. Enter your name
3. Enter the Room ID provided by the host
4. Click "Join Room"

### During the Party

- **Toggle Audio**: Click the 🎤 button to turn microphone on/off
- **Toggle Video**: Click the 📹 button to turn camera on/off
- **Share Screen**: Click the 🖥️ button to share your screen with others
- **Send Chat**: Type messages in the chat box and send
- **View Participants**: Click the "People" tab to see who's in the room
- **Leave**: Click the 📞 button to exit the room

## 🔧 API Endpoints

### HTTP API

#### Create Room
```
POST /api/rooms/create
Response: { roomId: "uuid" }
```

#### Get Room Info
```
GET /api/rooms/:roomId
Response: { roomId: "uuid", participants: [...], messageCount: number }
```

#### Health Check
```
GET /api/health
Response: { status: "Server is running" }
```

### WebSocket Events

#### Client → Server

- **join-room**: Join a watch party
  ```json
  { "type": "join-room", "roomId": "...", "userName": "..." }
  ```

- **leave-room**: Leave the watch party
  ```json
  { "type": "leave-room", "roomId": "..." }
  ```

- **signal**: Send WebRTC signal for peer connection
  ```json
  { "type": "signal", "to": "userId", "signal": {...} }
  ```

- **chat**: Send a chat message
  ```json
  { "type": "chat", "roomId": "...", "text": "..." }
  ```

- **user-info**: Update user information
  ```json
  { "type": "user-info", "userName": "..." }
  ```

#### Server → Client

- **room-joined**: Confirmation of room join
  ```json
  { "type": "room-joined", "roomId": "...", "userId": "...", "participants": [...], "messages": [...] }
  ```

- **user-joined**: New participant joined
  ```json
  { "type": "user-joined", "userId": "...", "userName": "...", "participants": [...] }
  ```

- **user-left**: Participant left
  ```json
  { "type": "user-left", "userId": "...", "participants": [...] }
  ```

- **signal**: Receive WebRTC signal from peer
  ```json
  { "type": "signal", "from": "userId", "signal": {...} }
  ```

- **chat**: New chat message
  ```json
  { "type": "chat", "message": { "userId": "...", "userName": "...", "text": "...", "timestamp": "..." } }
  ```

## 🐛 Troubleshooting

### No Video/Audio
1. Check browser permissions for camera and microphone
2. Ensure your devices are not already in use by another application
3. Try a different browser

### Connection Issues
1. Verify the backend server is running on port 5000
2. Check your firewall settings
3. Ensure WebSocket connections are not blocked

### Screen Sharing Not Working
1. Some browsers require HTTPS for screen sharing (except localhost)
2. Check browser permissions for screen capture
3. Try using a supported browser (Chrome, Firefox, Edge)

### Participants Can't See Each Other
1. Check internet connection
2. Verify STUN servers are accessible
3. Check browser console for WebRTC errors

## 📊 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| Safari | 14.1+ | ✅ Full Support |

## 🔐 Security Considerations

1. **HTTPS**: For production, use HTTPS/WSS instead of HTTP/WS
2. **Authentication**: Add user authentication to prevent unauthorized room access
3. **Rate Limiting**: Implement rate limiting on the server
4. **Validation**: All user inputs should be validated and sanitized
5. **Data Privacy**: Consider end-to-end encryption for sensitive use cases

## 🚀 Future Enhancements

- User authentication and accounts
- Room passwords for privacy
- Recording capability
- Custom backgrounds or blur effects
- Raise hand feature
- Recording & playback
- Screen annotation tools
- Mobile-optimized interface
- Docker containerization
- Database integration (MongoDB/PostgreSQL)
- Analytics and logging

## 📝 Development Notes

### Adding More STUN/TURN Servers
Edit `CONFIG.STUN_SERVERS` in `app.js`:
```javascript
const CONFIG = {
  STUN_SERVERS: [
    { urls: 'stun:your-stun-server.com' },
    // Add more servers as needed
  ],
  TURN_SERVERS: [
    { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
  ]
};
```

### Scaling for More Participants
- Consider using a TURN server for better connectivity behind firewalls
- Implement selective forwarding for large groups
- Add bandwidth optimization
- Use hardware acceleration for video encoding

### Performance Optimization
- Implement adaptive bitrate streaming
- Add connection quality indicators
- Optimize WebRTC codec selection
- Implement efficient message batching

## 📄 License

This project is open-source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Watch Partying!** 🎉
