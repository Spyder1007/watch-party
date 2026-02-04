# Watch Party - Deployment Guide

This guide explains how to deploy Watch Party to production and make it available online.

## 🌐 Deployment Options

### Option 1: Heroku (Easiest for Beginners)

#### Prerequisites
- Heroku account (https://www.heroku.com)
- Git installed
- Heroku CLI installed

#### Steps

1. **Prepare for Heroku**
```bash
cd watchparty
git init
git add .
git commit -m "Initial commit"
```

2. **Create Heroku App**
```bash
heroku create your-watchparty-name
```

3. **Deploy Backend**
```bash
git push heroku main
```

4. **Set Environment**
```bash
heroku config:set NODE_ENV=production
```

5. **Configure Frontend**
Update `client/public/js/app.js`:
```javascript
const CONFIG = {
  SERVER_URL: 'https://your-watchparty-name.herokuapp.com',
  WS_URL: 'wss://your-watchparty-name.herokuapp.com',
  // ... rest of config
};
```

6. **Deploy Frontend to Netlify**
- Connect GitHub repo to Netlify
- Publish `client/public` folder
- Update base URL in Netlify environment

#### Result
- Backend: https://your-watchparty-name.herokuapp.com
- Frontend: https://your-watchparty.netlify.app

---

### Option 2: Docker Containerization

#### Prerequisites
- Docker installed
- Docker Hub account

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy backend
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy frontend
COPY client/public ./public

# Copy server code
COPY server/server.js ./server/

EXPOSE 5000

WORKDIR /app/server
CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t watchparty:latest .

# Run container
docker run -p 5000:5000 watchparty:latest

# Push to Docker Hub
docker tag watchparty:latest username/watchparty:latest
docker push username/watchparty:latest
```

#### Deploy to Docker Swarm or Kubernetes
See respective documentation for orchestration

---

### Option 3: AWS Deployment

#### Using Elastic Beanstalk

1. **Install AWS CLI**
```bash
pip install awsebcli
```

2. **Initialize**
```bash
eb init -p node.js-16 watchparty
```

3. **Create Environment**
```bash
eb create watchparty-env
```

4. **Deploy**
```bash
eb deploy
```

5. **Configure**
```bash
eb setenv NODE_ENV=production
```

#### Using EC2 + Load Balancer

1. Launch EC2 instance (Ubuntu 20.04)
2. Install Node.js and npm
3. Clone repository
4. Run with PM2 (process manager)
5. Setup Nginx as reverse proxy
6. Configure SSL certificate
7. Point domain to Elastic IP

---

### Option 4: Google Cloud Run

1. **Containerize** (see Docker section)

2. **Deploy**
```bash
gcloud run deploy watchparty \
  --image gcr.io/YOUR_PROJECT/watchparty \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **View logs**
```bash
gcloud run logs read
```

---

### Option 5: DigitalOcean (Budget-Friendly)

1. **Create Droplet**
   - Choose Ubuntu 20.04
   - Size: $5-12/month
   - Add SSH key

2. **SSH into Server**
```bash
ssh root@YOUR_IP
```

3. **Setup Server**
```bash
apt-get update && apt-get upgrade
apt-get install nodejs npm git

git clone https://github.com/YOUR_USERNAME/watchparty.git
cd watchparty/server
npm install
```

4. **Install PM2** (keeps app running)
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

5. **Setup Nginx** (reverse proxy)
```bash
apt-get install nginx
# Configure /etc/nginx/sites-available/watchparty
systemctl restart nginx
```

6. **Setup SSL** (free with Certbot)
```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## 🔐 Production Security Setup

### 1. Enable HTTPS/WSS

**Self-signed certificate** (testing):
```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

**Update server.js**:
```javascript
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });
```

### 2. Add Authentication

```javascript
// Simple authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // Verify token...
  next();
};

app.post('/api/rooms/create', authenticate, (req, res) => {
  // ... create room
});
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 4. CORS Configuration

```javascript
const corsOptions = {
  origin: ['https://yourfrontend.com'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5. Input Validation

```bash
npm install joi
```

```javascript
const Joi = require('joi');

const schema = Joi.object({
  roomId: Joi.string().uuid().required(),
  userName: Joi.string().max(50).required()
});

const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.details });
```

---

## 🗄️ Database Setup (Optional)

### Using MongoDB

1. **Create Cluster** on MongoDB Atlas (mongodb.com/cloud/atlas)

2. **Install Driver**
```bash
npm install mongodb
```

3. **Update server.js**
```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function connect() {
  await client.connect();
  return client.db('watchparty');
}

// Use database for rooms, messages, users
```

### Using PostgreSQL

1. **Install**
```bash
npm install pg
```

2. **Configure Connection**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

3. **Create Tables**
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  participant_count INTEGER
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  user_name VARCHAR(50),
  text VARCHAR(200),
  created_at TIMESTAMP
);
```

---

## 📊 Performance Optimization

### 1. Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Use CDN for Static Assets

```html
<!-- In index.html -->
<link rel="stylesheet" href="https://cdn.example.com/styles.css">
```

### 3. Implement Caching

```javascript
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});
```

### 4. Optimize Video Codecs

```javascript
// In client app.js
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
});
```

### 5. Use Load Balancer

- AWS Elastic Load Balancer
- Google Cloud Load Balancing
- DigitalOcean Load Balancer
- Nginx reverse proxy

---

## 📈 Monitoring & Analytics

### Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({ 
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0 
});
```

### LogRocket (Session Replay)

```html
<script src="https://cdn.logrocket.com/js/logrocket.js"></script>
<script>
  window.LogRocket && window.LogRocket.init('app-id');
</script>
```

### Google Analytics

```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install dependencies
      run: |
        cd server
        npm install
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

---

## 🚨 Pre-Launch Checklist

- [ ] HTTPS/WSS enabled
- [ ] Authentication implemented
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Database configured
- [ ] Error logging setup
- [ ] SSL certificate valid
- [ ] Domain pointing to server
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring tools running
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Emergency contacts listed

---

## 📞 Deployment Support

### Common Issues

**HTTPS Certificate Error**
- Ensure certificate is valid
- Check certificate expiry
- Renew with Certbot if needed

**WebSocket Connection Fails**
- Verify WSS is configured
- Check firewall allows port 443
- Verify domain DNS resolution

**High Memory Usage**
- Monitor PM2 processes
- Implement connection pooling
- Add more server resources

**Slow Performance**
- Check server CPU/memory
- Monitor database queries
- Review network bandwidth

---

## 📝 Post-Deployment

1. **Monitor Performance**
   - Check error logs
   - Monitor user metrics
   - Track server resources

2. **Maintain Updates**
   - Keep Node.js updated
   - Update dependencies regularly
   - Patch security vulnerabilities

3. **Gather Feedback**
   - User testing
   - Beta releases
   - Community feedback

4. **Scale as Needed**
   - Add servers
   - Optimize database
   - Implement caching

---

For more help, refer to the main README.md or open an issue on GitHub!
