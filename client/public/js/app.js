// Configuration
const CONFIG = {
  SERVER_URL: window.location.origin,
  WS_URL: window.location.protocol === 'https:' 
    ? `wss://${window.location.host}` 
    : `ws://${window.location.host}`,
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Free public TURN servers for better connectivity
    {
      urls: ['turn:numb.viagenie.ca'],
      username: 'webrtc@live.com',
      credential: 'webrtc'
    },
    {
      urls: ['turn:openrelay.metered.ca:80'],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: ['turn:openrelay.metered.ca:443'],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

// Global State
class WatchPartyApp {
  constructor() {
    this.state = {
      currentPage: 'landing',
      roomId: null,
      userId: null,
      userName: '',
      ws: null,
      peers: new Map(),
      localStream: null,
      screenStream: null,
      isAudioOn: true,
      isVideoOn: true,
      isScreenSharing: false,
      participants: [],
      messages: [],
      sidebarTab: 'chat'
    };
  }

  async init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const app = document.getElementById('app');

    if (this.state.currentPage === 'landing') {
      app.innerHTML = this.renderLanding();
    } else if (this.state.currentPage === 'room') {
      app.innerHTML = this.renderRoom();
      this.setupRoomControls();
    }
  }

  renderLanding() {
    return `
      <div class="landing">
        <h1>🎬 Watch Party</h1>
        <p>Share, watch, and chat with friends in real-time</p>
        <div class="input-group">
          <input type="text" id="userName" placeholder="Enter your name" maxlength="50">
        </div>
        <div class="landing-buttons">
          <button class="btn btn-primary" id="createRoomBtn">Create Room</button>
          <div style="display: flex; gap: 0.5rem; width: 100%; justify-content: center; flex-wrap: wrap;">
            <input type="text" id="joinRoomInput" placeholder="Enter room ID to join" maxlength="50" style="padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; background: var(--card-bg); color: var(--text-light); width: auto; min-width: 250px;">
            <button class="btn btn-secondary" id="joinRoomBtn">Join Room</button>
          </div>
        </div>
      </div>
    `;
  }

  renderRoom() {
    return `
      <div class="room-page">
        <div class="room-header">
          <div>
            <span class="room-id">Room ID: <span class="room-id-value">${this.state.roomId}</span></span>
          </div>
          <div class="participant-count">
            👥 ${this.state.participants.length} Participant${this.state.participants.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div class="room-content">
          <div class="video-section" id="videoSection">
            <div class="loading">
              <div class="spinner"></div>
              <div class="status-message">Initializing video...</div>
            </div>
          </div>
          
          <div class="sidebar">
            <div class="sidebar-tabs">
              <button class="sidebar-tab ${this.state.sidebarTab === 'chat' ? 'active' : ''}" data-tab="chat">💬 Chat</button>
              <button class="sidebar-tab ${this.state.sidebarTab === 'participants' ? 'active' : ''}" data-tab="participants">👥 People</button>
            </div>
            
            <div class="sidebar-content">
              <div id="chatTab" class="sidebar-content-pane" style="display: ${this.state.sidebarTab === 'chat' ? 'flex' : 'none'}; flex-direction: column; height: 100%;">
                <div class="messages-list" id="messagesList"></div>
                <div class="chat-input-area">
                  <input type="text" id="chatInput" placeholder="Type a message..." maxlength="200">
                  <button class="send-btn" id="sendBtn">Send</button>
                </div>
              </div>
              
              <div id="participantsTab" class="sidebar-content-pane" style="display: ${this.state.sidebarTab === 'participants' ? 'flex' : 'none'}; flex-direction: column;">
                <div class="participants-list" id="participantsList"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bottom-controls">
          <button class="control-btn ${this.state.isAudioOn ? 'active' : 'inactive'}" id="audioBtn" title="Toggle Audio">🎤</button>
          <button class="control-btn ${this.state.isVideoOn ? 'active' : 'inactive'}" id="videoBtn" title="Toggle Video">📹</button>
          <button class="control-btn screen-share-btn" id="screenShareBtn" title="Share Screen">🖥️</button>
          <button class="control-btn leave-btn" id="leaveBtn" title="Leave Room">📞</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (this.state.currentPage === 'landing') {
      document.getElementById('createRoomBtn').addEventListener('click', () => this.createRoom());
      document.getElementById('joinRoomBtn').addEventListener('click', () => this.joinRoomPrompt());
      
      // Allow Enter key in input
      document.getElementById('userName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.createRoom();
      });
      document.getElementById('joinRoomInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.joinRoomPrompt();
      });
    }
  }

  setupRoomControls() {
    // Tab switching
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.state.sidebarTab = tabName;
        this.updateSidebarUI();
      });
    });

    // Video/Audio Controls
    document.getElementById('audioBtn').addEventListener('click', () => this.toggleAudio());
    document.getElementById('videoBtn').addEventListener('click', () => this.toggleVideo());
    document.getElementById('screenShareBtn').addEventListener('click', () => this.toggleScreenShare());
    document.getElementById('leaveBtn').addEventListener('click', () => this.leaveRoom());

    // Chat
    document.getElementById('sendBtn').addEventListener('click', () => this.sendChat());
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendChat();
    });

    this.initializeMedia();
  }

  async initializeMedia() {
    try {
      console.log('Requesting media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      console.log('✅ Media stream obtained:', stream);
      this.state.localStream = stream;
      
      // Verify stream has both audio and video
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      console.log(`Track count - Audio: ${audioTracks.length}, Video: ${videoTracks.length}`);
      
      // Ensure tracks are enabled
      audioTracks.forEach((track, i) => {
        track.enabled = this.state.isAudioOn;
        console.log(`Audio track ${i}: enabled=${track.enabled}`);
      });
      
      videoTracks.forEach((track, i) => {
        track.enabled = this.state.isVideoOn;
        console.log(`Video track ${i}: enabled=${track.enabled}`);
      });
      
      if (audioTracks.length === 0) {
        console.warn('⚠️  No audio tracks found!');
        alert('Warning: No microphone detected. Audio will not work.');
      }
      if (videoTracks.length === 0) {
        console.warn('⚠️  No video tracks found!');
        alert('Warning: No camera detected. Video will not work.');
      }
      
      this.displayLocalVideo();
      await this.connectWebSocket();
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      alert(`Failed to access camera/microphone.\n\nError: ${error.message}\n\nPlease check:\n1. Browser permissions\n2. Camera/microphone not in use\n3. Try refreshing the page`);
    }
  }

  displayLocalVideo() {
    const videoSection = document.getElementById('videoSection');
    if (!videoSection) return;

    const localVideoContainer = document.createElement('div');
    localVideoContainer.className = 'video-container';
    localVideoContainer.id = 'local-video-container';

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsinline = true;
    video.srcObject = this.state.localStream;

    const label = document.createElement('div');
    label.className = 'video-label';
    label.textContent = `${this.state.userName} (You)`;

    localVideoContainer.appendChild(video);
    localVideoContainer.appendChild(label);

    // Clear loading state
    videoSection.innerHTML = '';
    videoSection.appendChild(localVideoContainer);
  }

  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.state.ws = new WebSocket(CONFIG.WS_URL);

      this.state.ws.onopen = () => {
        console.log('WebSocket connected to', CONFIG.WS_URL);
        console.log('Joining room:', this.state.roomId);
        
        // Join room
        this.state.ws.send(JSON.stringify({
          type: 'join-room',
          roomId: this.state.roomId,
          userName: this.state.userName
        }));

        resolve();
      };

      this.state.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message.type);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.state.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.state.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'room-joined':
        console.log('Room joined');
        this.handleRoomJoined(message);
        break;
      case 'user-joined':
        console.log('User joined:', message.userId);
        this.handleUserJoined(message);
        break;
      case 'user-left':
        console.log('User left:', message.userId);
        this.handleUserLeft(message);
        break;
      case 'signal':
        console.log('Signal message received');
        this.handleSignal(message);
        break;
      case 'chat':
        console.log('Chat message received');
        this.handleChatMessage(message);
        break;
    }
  }

  handleRoomJoined(message) {
    console.log('Room joined, participants:', message.participants);
    this.state.participants = message.participants;
    this.state.messages = message.messages || [];
    this.updateParticipantsList();
    this.updateMessagesList();
    
    console.log(`Total participants in room: ${message.participants.length}`);
    
    // Initiate connections to existing participants
    const existingPeers = message.participants.filter(p => p.userId !== this.state.userId);
    console.log(`Initiating connections with ${existingPeers.length} existing peers`);
    
    existingPeers.forEach(participant => {
      console.log(`Connecting to peer: ${participant.userId} (${participant.userName})`);
      this.initiatePeerConnection(participant.userId);
    });
  }

  handleUserJoined(message) {
    this.state.participants = message.participants;
    this.updateParticipantsList();
    
    // Only initiate connection from existing user to new user (avoid duplicate connections)
    if (message.userId !== this.state.userId) {
      this.initiatePeerConnection(message.userId);
    }
  }

  handleUserLeft(message) {
    this.state.participants = message.participants;
    this.closePeerConnection(message.userId);
    this.removeRemoteVideo(message.userId);
    this.updateParticipantsList();
  }

  initiatePeerConnection(peerId) {
    if (this.state.peers.has(peerId)) {
      console.log(`Peer connection already exists with ${peerId}`);
      return;
    }

    console.log(`Initiating peer connection with ${peerId}`);
    console.log('LocalStream state:', {
      exists: !!this.state.localStream,
      audioTracks: this.state.localStream ? this.state.localStream.getAudioTracks().length : 0,
      videoTracks: this.state.localStream ? this.state.localStream.getVideoTracks().length : 0
    });

    // Verify SimplePeer is available
    if (typeof SimplePeer === 'undefined') {
      console.error('SimplePeer library not loaded!');
      return;
    }

    try {
      const peer = new SimplePeer({
        initiator: true,
        stream: this.state.localStream,
        config: {
          iceServers: CONFIG.ICE_SERVERS
        },
        iceTransportPolicy: 'all',
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        },
        answerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        }
      });

      console.log(`SimplePeer instance created for ${peerId}`);

      peer.on('signal', (data) => {
        console.log(`[${peerId}] Signal event:`, data.type);
        if (this.state.ws && this.state.ws.readyState === WebSocket.OPEN) {
          this.state.ws.send(JSON.stringify({
            type: 'signal',
            to: peerId,
            signal: data
          }));
          console.log(`[${peerId}] Signal sent via WebSocket`);
        } else {
          console.error(`[${peerId}] WebSocket not ready. State: ${this.state.ws ? this.state.ws.readyState : 'null'}`);
        }
      });

      peer.on('connect', () => {
        console.log(`[${peerId}] ✅ Peer connection established`);
      });

      peer.on('stream', (stream) => {
        console.log(`[${peerId}] 📹 Received stream!`, {
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
          id: stream.id
        });
        this.displayRemoteVideo(peerId, stream);
      });

      peer.on('track', (track, stream) => {
        console.log(`[${peerId}] Track received:`, {
          kind: track.kind,
          enabled: track.enabled,
          streamId: stream.id
        });
      });

      peer.on('error', (error) => {
        console.error(`[${peerId}] ❌ Error in peer connection:`, error);
      });

      peer.on('close', () => {
        console.log(`[${peerId}] Peer connection closed`);
        this.removeRemoteVideo(peerId);
      });

      this.state.peers.set(peerId, peer);
      console.log(`[${peerId}] Peer added to state. Total peers: ${this.state.peers.size}`);
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  }

  handleSignal(message) {
    const { from, signal } = message;

    console.log(`[${from}] Received signal:`, signal.type);

    if (!this.state.peers.has(from)) {
      console.log(`[${from}] No peer exists, creating non-initiator peer...`);
      
      try {
        const peer = new SimplePeer({
          initiator: false,
          stream: this.state.localStream,
          config: {
            iceServers: CONFIG.ICE_SERVERS
          },
          iceTransportPolicy: 'all',
          offerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          },
          answerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          }
        });

        console.log(`[${from}] Non-initiator SimplePeer instance created`);

        peer.on('signal', (data) => {
          console.log(`[${from}] Signal event (non-initiator):`, data.type);
          if (this.state.ws && this.state.ws.readyState === WebSocket.OPEN) {
            this.state.ws.send(JSON.stringify({
              type: 'signal',
              to: from,
              signal: data
            }));
            console.log(`[${from}] Signal sent back via WebSocket`);
          } else {
            console.error(`[${from}] WebSocket not ready when sending signal`);
          }
        });

        peer.on('connect', () => {
          console.log(`[${from}] ✅ Peer connection established (non-initiator)`);
        });

        peer.on('stream', (stream) => {
          console.log(`[${from}] 📹 Received stream (non-initiator)!`, {
            audioTracks: stream.getAudioTracks().length,
            videoTracks: stream.getVideoTracks().length,
            id: stream.id
          });
          this.displayRemoteVideo(from, stream);
        });

        peer.on('track', (track, stream) => {
          console.log(`[${from}] Track received (non-initiator):`, {
            kind: track.kind,
            enabled: track.enabled,
            streamId: stream.id
          });
        });

        peer.on('error', (error) => {
          console.error(`[${from}] ❌ Error (non-initiator):`, error);
        });

        peer.on('close', () => {
          console.log(`[${from}] Peer connection closed (non-initiator)`);
          this.removeRemoteVideo(from);
        });

        this.state.peers.set(from, peer);
        console.log(`[${from}] Non-initiator peer added to state. Total peers: ${this.state.peers.size}`);
      } catch (error) {
        console.error(`[${from}] Error creating non-initiator peer:`, error);
        return;
      }
    }

    // Now signal the peer with the received signal
    try {
      const peer = this.state.peers.get(from);
      if (peer) {
        console.log(`[${from}] Signaling peer with ${signal.type}`);
        peer.signal(signal);
        console.log(`[${from}] Signal processed`);
      } else {
        console.error(`[${from}] Peer object not found in map`);
      }
    } catch (error) {
      console.error(`[${from}] Error signaling peer:`, error);
    }
  }

  displayRemoteVideo(peerId, stream) {
    console.log(`Displaying remote video for ${peerId}, stream has:`, {
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length,
      allTracks: stream.getTracks().length
    });

    const videoSection = document.getElementById('videoSection');
    if (!videoSection) {
      console.error('Video section not found!');
      return;
    }

    // Check if video already exists
    if (document.getElementById(`remote-video-${peerId}`)) {
      console.log(`Remote video already exists for ${peerId}`);
      return;
    }

    const remoteVideoContainer = document.createElement('div');
    remoteVideoContainer.className = 'video-container';
    remoteVideoContainer.id = `remote-video-${peerId}`;

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsinline = true;
    video.muted = false;  // Ensure audio is NOT muted
    video.volume = 1.0;    // Max volume
    video.srcObject = stream;

    // Add event listeners for debugging
    video.addEventListener('loadedmetadata', () => {
      console.log(`Video loaded for ${peerId}, playing...`);
      video.play().catch(err => console.error(`Error playing video for ${peerId}:`, err));
    });

    video.addEventListener('play', () => {
      console.log(`Video playing for ${peerId}`);
    });

    video.addEventListener('error', (e) => {
      console.error(`Video error for ${peerId}:`, e);
    });

    const label = document.createElement('div');
    label.className = 'video-label';
    const participant = this.state.participants.find(p => p.userId === peerId);
    label.textContent = participant ? participant.userName : 'Unknown';

    remoteVideoContainer.appendChild(video);
    remoteVideoContainer.appendChild(label);
    videoSection.appendChild(remoteVideoContainer);
    
    console.log(`Remote video element created and added to DOM for ${peerId}`);
  }

  removeRemoteVideo(peerId) {
    const videoElement = document.getElementById(`remote-video-${peerId}`);
    if (videoElement) {
      videoElement.remove();
    }
  }

  closePeerConnection(peerId) {
    const peer = this.state.peers.get(peerId);
    if (peer) {
      peer.destroy();
      this.state.peers.delete(peerId);
    }
  }

  toggleAudio() {
    this.state.isAudioOn = !this.state.isAudioOn;
    if (this.state.localStream) {
      this.state.localStream.getAudioTracks().forEach(track => {
        track.enabled = this.state.isAudioOn;
      });
    }
    this.updateControlButtons();
  }

  toggleVideo() {
    this.state.isVideoOn = !this.state.isVideoOn;
    if (this.state.localStream) {
      this.state.localStream.getVideoTracks().forEach(track => {
        track.enabled = this.state.isVideoOn;
      });
    }
    this.updateControlButtons();
  }

  async toggleScreenShare() {
    if (this.state.isScreenSharing) {
      // Stop screen sharing
      console.log('Stopping screen share...');
      if (this.state.screenStream) {
        this.state.screenStream.getTracks().forEach(track => track.stop());
        this.state.screenStream = null;
      }
      
      // Switch back to camera
      const videoTrack = this.state.localStream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error('No video track available to switch back to');
        return;
      }

      console.log('Replacing screen track with camera track...');
      let replacedCount = 0;
      this.state.peers.forEach((peer, peerId) => {
        try {
          const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack).then(() => {
              replacedCount++;
              console.log(`Replaced track for peer ${peerId}`);
            }).catch(err => {
              console.error(`Error replacing track for peer ${peerId}:`, err);
            });
          }
        } catch (error) {
          console.error(`Error replacing track for peer ${peerId}:`, error);
        }
      });
      console.log(`Screen share stopped. Replaced ${replacedCount} tracks`);
      
      this.state.isScreenSharing = false;
    } else {
      // Start screen sharing
      try {
        console.log('Starting screen share...');
        this.state.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: false
        });

        const screenTrack = this.state.screenStream.getVideoTracks()[0];
        console.log('Screen track obtained:', screenTrack);
        
        // Replace video track in all peer connections
        let replacedCount = 0;
        this.state.peers.forEach((peer, peerId) => {
          try {
            const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(screenTrack).then(() => {
                replacedCount++;
                console.log(`Replaced track for peer ${peerId} with screen`);
              }).catch(err => {
                console.error(`Error replacing track for peer ${peerId}:`, err);
              });
            }
          } catch (error) {
            console.error(`Error replacing track for peer ${peerId}:`, error);
          }
        });
        console.log(`Screen share started. Replaced ${replacedCount} tracks`);

        this.state.isScreenSharing = true;

        // Stop screen sharing when user stops sharing
        screenTrack.onended = () => {
          console.log('User stopped screen sharing');
          this.toggleScreenShare();
        };
      } catch (error) {
        console.error('Error accessing screen:', error);
        if (error.name === 'NotAllowedError') {
          alert('Screen share permission denied');
        } else if (error.name === 'NotFoundError') {
          alert('No screens found');
        } else {
          alert(`Screen share error: ${error.message}`);
        }
      }
    }

    this.updateControlButtons();
  }

  updateControlButtons() {
    const audioBtn = document.getElementById('audioBtn');
    const videoBtn = document.getElementById('videoBtn');
    const screenShareBtn = document.getElementById('screenShareBtn');

    if (audioBtn) {
      audioBtn.classList.toggle('active', this.state.isAudioOn);
      audioBtn.classList.toggle('inactive', !this.state.isAudioOn);
    }

    if (videoBtn) {
      videoBtn.classList.toggle('active', this.state.isVideoOn);
      videoBtn.classList.toggle('inactive', !this.state.isVideoOn);
    }

    if (screenShareBtn) {
      screenShareBtn.style.opacity = this.state.isScreenSharing ? '1' : '0.6';
    }
  }

  sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text) return;

    this.state.ws.send(JSON.stringify({
      type: 'chat',
      roomId: this.state.roomId,
      text: text
    }));

    input.value = '';
  }

  handleChatMessage(message) {
    const { message: chatMsg } = message;
    this.state.messages.push(chatMsg);
    this.updateMessagesList();
  }

  updateMessagesList() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    messagesList.innerHTML = this.state.messages.map(msg => `
      <div class="message">
        <div class="message-sender">${this.escapeHtml(msg.userName)}</div>
        <div class="message-text">${this.escapeHtml(msg.text)}</div>
        <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
      </div>
    `).join('');

    // Auto-scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  updateParticipantsList() {
    const participantsList = document.getElementById('participantsList');
    if (!participantsList) return;

    participantsList.innerHTML = this.state.participants.map(participant => `
      <div class="participant-item">
        <div>
          <div class="participant-name">${this.escapeHtml(participant.userName)}</div>
          <div class="participant-status">Joined ${new Date(participant.joinedAt).toLocaleTimeString()}</div>
        </div>
        <div class="status-indicator"></div>
      </div>
    `).join('');
  }

  updateSidebarUI() {
    const chatTab = document.getElementById('chatTab');
    const participantsTab = document.getElementById('participantsTab');
    const chatTabBtn = document.querySelectorAll('.sidebar-tab')[0];
    const participantsTabBtn = document.querySelectorAll('.sidebar-tab')[1];

    if (this.state.sidebarTab === 'chat') {
      chatTab.style.display = 'flex';
      participantsTab.style.display = 'none';
      chatTabBtn.classList.add('active');
      participantsTabBtn.classList.remove('active');
    } else {
      chatTab.style.display = 'none';
      participantsTab.style.display = 'flex';
      chatTabBtn.classList.remove('active');
      participantsTabBtn.classList.add('active');
    }
  }

  async createRoom() {
    const userName = document.getElementById('userName').value.trim();
    if (!userName) {
      alert('Please enter your name');
      return;
    }

    this.state.userName = userName;

    try {
      const response = await fetch(`${CONFIG.SERVER_URL}/api/rooms/create`, {
        method: 'POST'
      });
      const data = await response.json();
      this.state.roomId = data.roomId;
      this.state.userId = data.userId || 'user-' + Math.random().toString(36).substr(2, 9);
      this.state.currentPage = 'room';
      this.render();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  }

  joinRoomPrompt() {
    const userName = document.getElementById('userName').value.trim();
    const roomId = document.getElementById('joinRoomInput').value.trim();

    if (!userName) {
      alert('Please enter your name');
      return;
    }

    if (!roomId) {
      alert('Please enter a room ID');
      return;
    }

    this.joinRoom(roomId, userName);
  }

  async joinRoom(roomId, userName) {
    this.state.roomId = roomId;
    this.state.userName = userName;
    this.state.userId = 'user-' + Math.random().toString(36).substr(2, 9);
    this.state.currentPage = 'room';
    this.render();
  }

  leaveRoom() {
    if (confirm('Are you sure you want to leave?')) {
      if (this.state.ws) {
        this.state.ws.send(JSON.stringify({
          type: 'leave-room',
          roomId: this.state.roomId
        }));
        this.state.ws.close();
      }

      // Clean up
      if (this.state.localStream) {
        this.state.localStream.getTracks().forEach(track => track.stop());
      }

      if (this.state.screenStream) {
        this.state.screenStream.getTracks().forEach(track => track.stop());
      }

      this.state.peers.forEach(peer => peer.destroy());
      this.state.peers.clear();

      // Return to landing
      this.state.currentPage = 'landing';
      this.state.roomId = null;
      this.state.participants = [];
      this.state.messages = [];
      this.render();
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new WatchPartyApp();
  app.init();
});
