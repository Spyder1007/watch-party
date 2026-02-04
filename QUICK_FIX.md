# 🎬 Watch Party - Quick Fix Guide

**TL;DR:** Video/audio not working? Here's the fastest way to fix it.

---

## 🚀 Deploy Fix in 3 Steps

### **Step 1: Push Updated Code**
Open terminal/PowerShell and run:
```bash
cd c:\Users\mcw\Desktop\watchparty
git add .
git commit -m "WebRTC fixes"
git push origin main
```

### **Step 2: Wait for Replit Deploy**
- Go to Replit
- Wait 1-2 minutes
- Page should update automatically

### **Step 3: Test & Debug**
1. Open your Replit URL in **two browser windows**
2. Both join **same room**
3. Press **F12** to open console
4. Look at console logs (next section)

---

## 🔍 What to Look For in Console (F12)

### ✅ GOOD - Video Should Work
```
✅ WebSocket connected
✅ Peer connection established
✅ Received stream! audioTracks: 1, videoTracks: 1
✅ Video playing for [peer-id]
```

### ❌ BAD - Network Issue
```
❌ Peer connection established (MISSING)
   But you see: "Signal event: offer/answer"
   
Problem: ICE candidates not connecting
Solution: Try different WiFi/network
```

### ❌ BAD - Signals Not Sending
```
❌ No "Signal sent via WebSocket"
   
Problem: WebSocket not connected
Solution: Check Replit server status
```

### ❌ BAD - Video Won't Play
```
✅ Received stream! audioTracks: 1, videoTracks: 1
❌ Video element not appearing

Problem: Browser playback issue
Solution: Grant camera permissions again, refresh page
```

---

## 🛠️ Quick Fixes by Symptom

| Problem | Fix |
|---------|-----|
| Nothing works | Hard refresh (Ctrl+Shift+R) |
| Can't see video but hear audio | Grant camera permission again |
| Can't hear audio but see video | Grant microphone permission, check volume |
| Both don't work | Try different network (mobile hotspot) |
| Works locally but not with friend | Firewall blocking - try VPN |
| No console logs | SimplePeer not loaded - hard refresh |

---

## 📋 Testing Checklist

```
Before testing:
☐ Pushed code to Replit
☐ Waited 2 minutes for deploy
☐ Replit shows "Running"

During testing:
☐ Two users in same room
☐ Both see each other in participants list
☐ Opened F12 console in both windows
☐ Looking at console logs

Expected results:
☐ Can see friend's video
☐ Can hear friend's audio
☐ Console shows "✅ Peer connection established"
☐ Console shows "📹 Received stream"
```

---

## 🆘 Still Not Working?

1. **Screenshot your F12 console** - What's the last log message?
2. **Note which step fails** - Where in the list above?
3. **Try different network** - Some ISPs block P2P
4. **Restart browser** - Close all tabs, reopen

Then share these details and I'll add more targeted fixes!

---

## 📚 Full Documentation

- **Complete guide:** [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)
- **Summary of changes:** [FIXES_SUMMARY.md](FIXES_SUMMARY.md)

