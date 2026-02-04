# Watch Party - Debugging Guide

## WebRTC Connection Issues - Comprehensive Fixes

Your Watch Party app is experiencing WebRTC connection failures (no video/audio/screen share). This guide helps you identify and fix the issue.

---

## 🔧 Changes Made

### 1. **Enhanced Peer Connection Logging** (`client/public/js/app.js`)
- Added SimplePeer library availability check
- Added stream state verification before peer creation
- Added event logging for: signal, connect, stream, track, error, close
- Each event now logs with peer ID prefix for easy tracking

### 2. **Improved Signal Handling** (`client/public/js/app.js`)
- Added detailed logging for both initiator and non-initiator peers
- Added stream verification on both sides
- Added peer map size tracking
- Separate logging for signal sending and receiving

### 3. **Enhanced Remote Video Display** (`client/public/js/app.js`)
- Added stream track verification (audio + video)
- Added video element event listeners (loadedmetadata, play, error)
- Verified video is NOT muted (important for audio!)
- Added volume control (ensure max volume)
- Added auto-play with error handling

### 4. **Server-Side Signal Relay Logging** (`server/server.js`)
- Added logging when signals are relayed
- Added error detection if recipient not found
- Added room join logging with participant counts

### 5. **WebSocket Connection Logging** (`client/public/js/app.js`)
- Added URL logging to verify correct WebSocket connection
- Added room join logging
- Added message type logging for all WebSocket messages

---

## 🧪 Testing & Debugging Steps

### **Step 1: Push Updated Code**

```bash
cd c:\Users\mcw\Desktop\watchparty
git add .
git commit -m "Fix WebRTC debugging - add comprehensive logging"
git push origin main
```

Wait 1-2 minutes for Replit to auto-deploy.

### **Step 2: Test with Two Users**

1. **Open two browser windows:**
   - Window 1: `https://your-replit-url.replit.dev/`
   - Window 2: Same URL (can also use incognito mode)

2. **Join same room:**
   - Window 1: Enter name → Create Room → Note the Room ID
   - Window 2: Enter name → Join with Room ID

3. **Grant permissions when prompted:**
   - Allow camera access
   - Allow microphone access

### **Step 3: Open Browser Console (F12)**

Press **F12** to open Developer Tools → Click **"Console"** tab

You should see logs like:

```
✅ WebSocket connected to wss://your-domain
✅ Joining room: [room-id]
✅ Room joined, participants: [...]
✅ Initiating connections with X existing peers
[peer-id] Connecting to peer: [peer-id] (Friend's Name)
[peer-id] Signal event: offer
[peer-id] Signal sent via WebSocket
[peer-id] Peer connection established ✅
[peer-id] 📹 Received stream!
  audioTracks: 1
  videoTracks: 1
```

---

## 🔍 Troubleshooting by Symptom

### **❌ No Logs Appear at All**

**Problem:** SimplePeer not loading
- Check: `typeof SimplePeer` in console
- **Fix:** Hard refresh (Ctrl+Shift+R) to clear cache

### **❌ WebSocket Connection Error**

**Problem:** WebSocket not connecting
- **Check:** Console shows `WebSocket error` or `WebSocket not connected`
- **Fix:** 
  1. Verify Replit URL is correct
  2. Check network tab for failed WebSocket connection
  3. Replit might require WSS (check that logs show `wss://`)

### **❌ Signals Sent But No "Received stream"**

**Problem:** ICE candidates not connecting
- **Check:** Signals exchange (offer/answer/candidate) but no `Received stream`
- **Logs show:** `Signal event: offer` → `Signal event: answer` → `Signal event: candidate`
- **But no:** `Peer connection established` or `Received stream`
- **Fixes:**
  1. **Firewall issue** - Some networks block WebRTC
     - Test on different network (mobile hotspot)
  2. **STUN/TURN server issue** - Current servers may be blocked
     - Check console for: `candidate` events but none reaching peer
  3. **ISP blocking P2P** - Some ISPs block peer connections
     - Alternative: Use VPN or access from different network

### **❌ "Received stream" But No Video**

**Problem:** Stream received but video element not displaying
- **Check:** Console shows `Received stream!` with tracks but no video appears
- **Logs show:** Stream has audio/video tracks
- **But:** No video element visible or black screen
- **Fixes:**
  1. Check video element is muted correctly: `console.log(document.querySelector('video').muted)` should show `false` for remote video
  2. Volume issue: `console.log(document.querySelector('video').volume)` should show `1.0`
  3. Browser permissions: Refresh and grant camera/mic permissions again

### **❌ Audio Received But Video Not**

**Problem:** Can hear but can't see
- **Logs show:** `videoTracks: 0` in received stream
- **Cause:** Video not being captured or disabled
- **Fixes:**
  1. Check local video tab - is your own video showing?
  2. Click video button 📹 to toggle (might be disabled)
  3. Check browser camera permissions
  4. Try different video input device if available

---

## 📊 Expected Log Sequence

For a successful connection:

```
1. WebSocket connected to wss://...
2. Joining room: abc-123
3. Room joined, participants: [User2]
4. Initiating connections with 1 existing peers
5. Initiating peer connection with [peer-id]
6. SimplePeer instance created for [peer-id]
7. Signal event: offer
8. Signal sent via WebSocket
9. (Other user receives offer and creates peer)
10. [peer-id] Received signal: answer
11. Signal processed
12. Track received: audio, enabled: true
13. Track received: video, enabled: true
14. ✅ Peer connection established
15. 📹 Received stream!
    audioTracks: 1
    videoTracks: 1
16. Remote video element created and added to DOM for [peer-id]
17. Video playing for [peer-id]
```

---

## 🎯 Advanced Debugging

### **Check Peer Connection State**

In console, type:

```javascript
// See all peers
console.log(Array.from(app.state.peers.keys()));

// Check specific peer
const peers = app.state.peers;
peers.forEach((peer, id) => {
  console.log(id, {
    connected: peer.connected,
    initiator: peer.initiator,
    destroyed: peer.destroyed
  });
});

// Check local stream
console.log('Local stream:', {
  audio: app.state.localStream?.getAudioTracks().length,
  video: app.state.localStream?.getVideoTracks().length
});
```

### **Enable More Verbose WebRTC Logging**

Add to browser console:

```javascript
// Get internal WebRTC stats
navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
  stream.getTracks().forEach(track => {
    console.log('Track:', {
      kind: track.kind,
      label: track.label,
      enabled: track.enabled,
      readyState: track.readyState
    });
  });
  stream.getTracks().forEach(t => t.stop());
});
```

---

## 🚀 If Still Not Working

1. **Share the console logs** - Paste relevant error messages
2. **Describe the logs you see** - Which step fails?
3. **Try different network** - Borrow wifi or use mobile hotspot
4. **Check Replit server logs** - Click "Tools" → "Logs" to see server-side logs

---

## 📝 Common Solutions

| Symptom | Solution |
|---------|----------|
| No peer connected | Check WebSocket connection first |
| Signals not relaying | Verify server log shows "Signal relayed successfully" |
| No ICE candidates | Try different network or use VPN |
| Video muted | Check `muted: false` on remote video elements |
| Audio too quiet | Set `volume: 1.0` on remote video elements |
| SimplePeer undefined | Hard refresh (Ctrl+Shift+R) to reload JS |

---

## 🆘 Need More Help?

Share:
1. Screenshot of console errors
2. Console output starting from page load
3. Steps you took
4. What you expected vs what happened

