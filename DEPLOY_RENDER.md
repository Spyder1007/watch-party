# Watch Party - Quick Deployment to Render.com (FREE)

## 🚀 Step-by-Step Deployment Guide

### ✅ Prerequisites
- GitHub account (free)
- Render.com account (free)
- Your Watch Party project

---

## 📋 Part 1: Prepare Your Code (Already Done! ✓)

Your code is already updated for deployment:
- ✓ Frontend URLs auto-detect production domain
- ✓ Backend can serve static frontend
- ✓ WebSocket properly configured
- ✓ Procfile created for deployment

---

## 🔧 Part 2: Push to GitHub

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository name: `watchparty`
3. Click "Create repository"

### Step 2: Initialize Git in Your Project
```bash
cd c:\Users\mcw\Desktop\watchparty
git init
git add .
git commit -m "Initial commit - Watch Party application"
```

### Step 3: Connect to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/watchparty.git
git push -u origin main
```

(Replace YOUR_USERNAME with your GitHub username)

---

## 🌐 Part 3: Deploy to Render.com (FREE)

### Step 1: Sign Up for Render
1. Go to https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service
1. Go to https://dashboard.render.com
2. Click "+ New +"
3. Select "Web Service"
4. Select your `watchparty` repository
5. Click "Connect"

### Step 3: Configure Service
Fill in the configuration:

| Field | Value |
|-------|-------|
| Name | `watchparty` |
| Environment | `Node` |
| Region | `Oregon` (or closest to you) |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `node server/server.js` |

### Step 4: Add Environment Variables
Click "Add Environment Variable":

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

### Step 5: Deploy
1. Keep "Free" tier selected
2. Scroll down and click "Create Web Service"
3. Wait for deployment (2-3 minutes)

---

## ✅ Your Live URL

Once deployment completes, you'll get a URL like:
```
https://watchparty-xxxx.onrender.com
```

**This is your public link!** Share it with friends! 🎉

---

## 🔄 Automatic Deployments

After the first deployment, every time you push to GitHub, Render automatically redeploys:

```bash
# Make changes locally
git add .
git commit -m "Update features"
git push origin main

# Render automatically deploys!
```

---

## 📱 Share With Friends

Send them this link:
```
https://watchparty-xxxx.onrender.com
```

That's it! They can immediately:
1. Enter their name
2. Create or join a room
3. Video call, screen share, chat!

---

## ⚠️ Important Notes

### Free Tier Limitations (Render)
- ✓ Free hosting included
- ✓ HTTPS automatic (Let's Encrypt)
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Limited to 750 free hours/month

### When You're More Popular
If you get many users:
1. Upgrade to Paid tier ($12-25/month)
2. Auto-scaling available
3. Better performance

---

## 🔐 Custom Domain (Optional)

To use your own domain like `watchparty.mysite.com`:

1. Go to Render dashboard
2. Select your service
3. Go to "Settings" → "Custom Domains"
4. Add your domain
5. Follow DNS instructions

(You need to own the domain first)

---

## 🐛 Troubleshooting Deployment

### "Build failed"
- Check: `node_modules` is not committed
- Check: `npm install` runs without errors locally
- Push again after fixing

### "Deploy spinning"
- Wait 5-10 minutes
- Check Render logs (Logs tab)
- Look for error messages

### "Can't connect to server"
- Go to your Render service page
- Check if service is "Live" (green)
- Check browser console for connection errors

### "WebSocket connection fails"
- Render supports WebSocket ✓
- Check CORS headers
- Verify wss:// URLs in browser console

---

## 📊 Monitor Your Deployment

Go to https://dashboard.render.com:
- View logs in real-time
- See metrics (CPU, memory)
- Manage environment variables
- Redeploy if needed

---

## 💰 Costs

### Free Tier (Recommended Start)
- ✓ Free hosting
- ✓ Free HTTPS
- ✓ 750 hours/month
- ⚠️ Spins down after inactivity
- **Cost: $0/month**

### Paid Tier (When Growing)
- ✓ No spin-downs
- ✓ Better performance
- ✓ 24/7 uptime
- **Cost: $12-25+/month**

---

## 🎯 Next Steps

1. ✅ Code is ready (already updated)
2. 📤 Push to GitHub (follow Part 2)
3. 🚀 Deploy to Render (follow Part 3)
4. 🎉 Get your live URL
5. 🔗 Share with friends!

---

## 🆘 Need Help?

### Common Questions

**Q: How do I update the live version?**
A: Just do `git push` and Render automatically redeploys!

**Q: Can I use a different hosting?**
A: Yes! Heroku, AWS, DigitalOcean, etc. all work too.

**Q: How do I add a password to rooms?**
A: Modify `server.js` to add password check to join-room.

**Q: Can I change the colors?**
A: Yes! Edit `client/public/styles.css` CSS variables.

---

## 🎬 You're Ready!

Your Watch Party is about to go live! 🚀

**Follow these 3 parts and you'll have a live app in minutes!**

---

**Happy Deploying!** 🎉
