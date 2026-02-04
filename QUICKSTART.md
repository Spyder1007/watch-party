# Quick Start Guide for Watch Party

## 🎬 Get Started in 3 Steps

### Step 1: Install and Run the Backend

```bash
cd server
npm install
npm start
```

Wait for the message: `Watch Party Server running on port 5000`

### Step 2: Serve the Frontend

Open a new terminal and navigate to the client directory:

```bash
cd client/public
python -m http.server 8000
```

Or if using Node.js:
```bash
npx http-server
```

### Step 3: Open in Your Browser

- Open `http://localhost:8000` in your browser
- Enter your name
- Click "Create Room" or enter a Room ID to join
- Share the Room ID with friends to invite them!

## 🎮 Common Commands

### Start Everything (On Windows)

Create a `start.bat` file in the watchparty folder:
```batch
@echo off
start cmd /k "cd server && npm install && npm start"
timeout /t 3
start cmd /k "cd client\public && python -m http.server 8000"
start http://localhost:8000
```

Then just double-click `start.bat`!

### Start Everything (On Mac/Linux)

Create a `start.sh` file in the watchparty folder:
```bash
#!/bin/bash
cd server
npm install &
npm start &
cd ../client/public
python -m http.server 8000 &
open http://localhost:8000
```

Then run: `chmod +x start.sh && ./start.sh`

## 💡 Tips

- **First Time Setup**: The first run will install dependencies (this takes a minute)
- **Multiple Participants**: Test with multiple browser windows or tabs
- **Camera/Mic Permissions**: Grant permissions when the browser asks
- **Screen Sharing**: Available in Chrome, Firefox, and Edge
- **Share Room ID**: The Room ID is displayed in the header of the watch party

## 📱 Testing Locally

1. Open `http://localhost:8000` in one browser window
2. Open `http://localhost:8000` in another browser window (or private window)
3. Both should have different Room IDs or join the same room
4. Test video/audio/chat features

## 🆘 Need Help?

- Check that Node.js is installed: `node --version`
- Verify the backend is running on port 5000
- Check browser console (F12) for error messages
- Ensure your camera/microphone permissions are granted
- Try a different browser if issues persist

---

**You're all set! Start hosting your watch parties!** 🎉
