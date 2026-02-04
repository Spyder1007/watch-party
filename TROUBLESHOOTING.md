# Watch Party - Troubleshooting & FAQs

## ❓ Frequently Asked Questions

### General Questions

**Q: How many people can use Watch Party at once?**
A: Theoretically unlimited, but practically 2-20 people for smooth performance. After ~20 people, consider using a SFU (Selective Forwarding Unit) for better performance.

**Q: Is it free to use?**
A: Yes! Watch Party is open-source and free to host and use.

**Q: Do I need to create an account?**
A: No, just enter your name and create/join a room.

**Q: Can I use Watch Party on mobile?**
A: Yes, but camera/microphone support varies by browser. Chrome, Firefox, and Edge on mobile are recommended.

**Q: How is data transmitted?**
A: Video/audio is sent peer-to-peer (directly between users). Chat and signaling go through the server. No data is stored permanently.

**Q: Is my conversation private?**
A: Peer-to-peer connections are private by default (encrypted by WebRTC). Add HTTPS/WSS and authentication for production deployment.

---

## 🐛 Troubleshooting

### No Video/Audio Issues

**Problem: Camera shows up but no video appears**
```
Solutions:
1. Check camera permissions in browser settings
2. Ensure camera is not in use by another app
3. Try another browser (Chrome, Firefox, Edge)
4. Restart your browser
5. Check System Settings → Privacy → Camera
```

**Problem: Can't hear audio**
```
Solutions:
1. Check speaker volume
2. Verify microphone permissions
3. Check browser audio output (DevTools → Audio)
4. Restart browser
5. Try different browser
6. Check system volume level
```

**Problem: Microphone not working**
```
Solutions:
1. Grant microphone permission when prompted
2. Check System Settings → Privacy → Microphone
3. Test microphone in system settings first
4. Disable mute in browser settings
5. Try default device in Audio settings
```

### Connection Issues

**Problem: Can't connect to the server**
```
Error: "Failed to connect"

Solutions:
1. Verify backend is running: npm start in server folder
2. Check port 5000 is not in use: netstat -ano | findstr :5000
3. Check firewall settings
4. Verify WebSocket URL in app.js (CONFIG.WS_URL)
5. Check network connection
```

**Problem: WebSocket connection keeps disconnecting**
```
Solutions:
1. Check internet connection stability
2. Verify firewall/VPN not blocking WebSocket
3. Increase connection timeout (server-side)
4. Check browser console for specific errors
5. Try different network (mobile hotspot)
```

**Problem: Peer connection fails**
```
Solutions:
1. Check STUN server accessibility
2. Try adding TURN server for firewalled networks
3. Check NAT traversal in network settings
4. Verify firewall allows UDP ports 49152-65535
5. Restart browser and try again
```

### Screen Sharing Issues

**Problem: Screen share button does nothing**
```
Solutions:
1. Not all browsers support screen sharing
2. Screen sharing requires HTTPS (except localhost)
3. Check browser permissions for screen capture
4. Try Chrome/Firefox/Edge (Safari limited support)
5. Check browser DevTools console for errors
```

**Problem: Screen share stops suddenly**
```
Solutions:
1. This is normal - user often clicks "Stop sharing"
2. Automatic reconnection should restore camera
3. If it doesn't, toggle video button to restart
4. Check browser permissions weren't revoked
5. Restart screen share if needed
```

### Chat Issues

**Problem: Messages not appearing**
```
Solutions:
1. Check message wasn't empty (minimum 1 char)
2. Verify WebSocket connection is active
3. Check console for send errors
4. Try refreshing the page
5. Verify all users in same room
```

**Problem: Old messages not showing when joining**
```
Note: Message history is loaded when you join
Solutions:
1. This is expected behavior for new joiners
2. Create new room to start fresh
3. Messages persist only during current session
4. Implement database for permanent storage
```

### UI/Display Issues

**Problem: Videos not displaying in grid**
```
Solutions:
1. Check screen resolution and zoom level
2. Try maximizing browser window
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try different browser
5. Check if videos are rendering but overlapped
```

**Problem: Controls buttons not responding**
```
Solutions:
1. Check JavaScript is enabled in browser
2. Clear browser cache and reload
3. Try different browser
4. Check console for JavaScript errors
5. Disable browser extensions
```

**Problem: Sidebar not appearing**
```
Solutions:
1. Check browser window width (may be collapsed on narrow screens)
2. Resize browser window larger
3. Check CSS loading properly
4. Verify no browser zoom applied
5. Try full-screen mode (F11)
```

### Performance Issues

**Problem: Video is lagging/stuttering**
```
Solutions:
1. Check internet bandwidth (use speedtest.net)
2. Close other applications using network
3. Move closer to WiFi router
4. Reduce video resolution (camera settings)
5. Use wired connection instead of WiFi
6. Close other browser tabs
```

**Problem: High CPU usage**
```
Solutions:
1. Close other applications
2. Disable browser extensions
3. Use hardware-accelerated video (Chrome settings)
4. Reduce number of video tiles
5. Close extra browser tabs
```

**Problem: Participants see but can't hear**
```
Solutions:
1. Toggle audio off/on with 🎤 button
2. Check system volume
3. Check speaker not muted
4. Restart browser
5. Check microphone position/angle
```

---

## 🔧 Advanced Troubleshooting

### Using Browser DevTools

**Open DevTools**: F12 or Ctrl+Shift+I

**Check for Errors**:
1. Click "Console" tab
2. Look for red error messages
3. Screenshot errors for reference

**Monitor Network**:
1. Click "Network" tab
2. Reload page
3. Look for failed requests (red)
4. Check WebSocket connection status

**Check Performance**:
1. Click "Performance" tab
2. Click record, perform action, stop
3. Look for long tasks or high CPU usage

### Command Line Debugging

**Check if backend is running**:
```bash
netstat -ano | findstr :5000
curl http://localhost:5000/api/health
```

**View server logs**:
```bash
# In the server terminal, watch console output
# Look for connection events and errors
```

**Check WebSocket connection**:
```bash
# In browser console:
console.log(app.state.ws.readyState)
# 0 = Connecting, 1 = Open, 2 = Closing, 3 = Closed
```

### Network Diagnosis

**Check STUN server connectivity**:
```bash
# Windows PowerShell
Test-NetConnection stun.l.google.com -Port 19302

# Linux/Mac
nc -zu stun.l.google.com 19302
```

**Test WebRTC capabilities**:
1. Visit: https://test.webrtc.org/
2. This tests your WebRTC setup
3. Check for any blockers or issues

---

## 🛠️ Configuration Tweaks

### Increase STUN Server Timeout
Edit `server.js`:
```javascript
const CONFIG = {
  STUN_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add more as backup
  ]
};
```

### Reduce Signaling Delay
In `app.js`, optimize WebSocket message batching:
```javascript
// Current: Messages sent individually
// Optimization: Batch messages for better performance
```

### Lower Video Quality (for slow networks)
In `app.js`, modify getUserMedia constraints:
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: { 
    width: { ideal: 640 },  // Lower resolution
    height: { ideal: 480 }
  }
});
```

---

## 💡 Performance Tips

### For Host/Server
- Run on dedicated machine
- Use stable internet connection
- Monitor resource usage
- Keep server updated
- Use HTTPS in production

### For Participants
- Close unnecessary browser tabs
- Disable browser extensions
- Use wired internet if possible
- Keep camera steady
- Position in well-lit area
- Close other applications

### For Network
- Use 5GHz WiFi instead of 2.4GHz
- Keep away from microwave/cordless phones
- Use wired connection for stability
- Monitor bandwidth usage
- Use QoS (Quality of Service) settings

---

## 📝 Error Message Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to access media devices" | Permission denied | Grant camera/mic permission |
| "Room not found" | Room doesn't exist | Check room ID, create new room |
| "WebSocket connection failed" | Server not running | Start backend server |
| "Peer connection failed" | Network blocked | Check firewall, use VPN |
| "Screen share denied" | Permission/support | Check browser, grant permission |
| "Invalid room ID format" | Bad room ID | Enter valid UUID format |

---

## 🆘 Still Having Issues?

### Debug Checklist
- [ ] Backend server running? (`npm start`)
- [ ] Frontend server running?
- [ ] Opening correct URL (http://localhost:8000)?
- [ ] Camera/mic permissions granted?
- [ ] Not behind corporate firewall?
- [ ] Browser fully updated?
- [ ] JavaScript enabled?
- [ ] No browser extensions interfering?
- [ ] Network connection stable?
- [ ] No other apps using camera/mic?

### Collecting Debug Information
When reporting issues, include:
1. Browser and version (Chrome 120, Firefox 121, etc.)
2. Operating system (Windows 10, macOS, Ubuntu, etc.)
3. Error messages from console (F12 → Console)
4. Network errors from DevTools (F12 → Network)
5. Steps to reproduce the issue
6. Screenshots if applicable
7. Backend console output

### Getting Help
1. Check this troubleshooting guide
2. Check GitHub issues
3. Create a new issue with debug information
4. Describe what you were doing when it failed
5. Include attempted solutions

---

## 🔄 Recovery Procedures

### Hard Reset (Nuclear Option)
1. Close all browser windows
2. Stop backend server (Ctrl+C)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart backend: `npm start`
5. Open fresh browser window
6. Try again

### Database Reset (if implemented)
```bash
# Delete and recreate database
# Drop tables, recreate schema
npm run migrate
```

### Clear WebSocket Cache
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

This troubleshooting guide covers most common issues. For additional help, consult the main README.md or FEATURES.md files!
