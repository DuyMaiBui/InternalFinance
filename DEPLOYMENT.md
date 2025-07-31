# Deployment Guide

## Option 1: Deploy to Vercel (Recommended - Free)

### Frontend (Vercel)
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Build and deploy frontend:
   ```bash
   cd frontend
   npm run build
   vercel
   ```
4. Follow prompts to deploy

### Backend (Vercel Serverless)
1. Create `backend/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```
2. Deploy backend:
   ```bash
   cd backend
   vercel
   ```
3. Add environment variables in Vercel dashboard

## Option 2: Deploy to Render (Free with limitations)

### Backend (Render)
1. Create account at [render.com](https://render.com)
2. New > Web Service
3. Connect GitHub repo or use Git URL
4. Configuration:
   - Name: family-expense-backend
   - Root Directory: backend
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `JWT_SECRET`
   - `FIREBASE_SERVICE_ACCOUNT`

### Frontend (Render Static Site)
1. New > Static Site
2. Configuration:
   - Name: family-expense-frontend
   - Root Directory: frontend
   - Build Command: `npm install && npm run build`
   - Publish Directory: build
3. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL

## Option 3: Deploy to Firebase Hosting (Google)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase:
   ```bash
   firebase init
   ```
   - Select: Hosting, Functions
   - Use existing project
   - Public directory: `frontend/build`
   - Single-page app: Yes

3. Deploy everything:
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Deploy
   cd ..
   firebase deploy
   ```

## Option 4: Deploy to Railway (Simple, Pay-as-you-go)

1. Create account at [railway.app](https://railway.app)
2. New Project > Deploy from GitHub repo
3. Add environment variables
4. Railway automatically deploys both frontend and backend

## Option 5: Self-Host on VPS

### Using PM2 on Ubuntu/Debian:

1. Setup VPS (DigitalOcean, Linode, etc.)

2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Install PM2:
   ```bash
   sudo npm install -g pm2
   ```

4. Clone and setup:
   ```bash
   git clone <your-repo>
   cd internal_finance
   
   # Backend
   cd backend
   npm install
   pm2 start src/server.js --name expense-backend
   
   # Frontend
   cd ../frontend
   npm install
   npm run build
   ```

5. Install Nginx:
   ```bash
   sudo apt install nginx
   ```

6. Configure Nginx (`/etc/nginx/sites-available/expense-tracker`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/frontend/build;
           try_files $uri /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Important Production Steps

### 1. Update Frontend API URL
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.com
```

### 2. Update Frontend API Calls
Update `frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3. Update Authentication
Replace all axios calls in components to use the API service.

### 4. Security Checklist
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set up HTTPS (SSL certificate)
- [ ] Configure CORS for your domain only
- [ ] Enable Firebase Security Rules
- [ ] Set up rate limiting
- [ ] Configure backup strategy

### 5. Monitoring (Optional)
- Set up error tracking (Sentry)
- Add analytics (Google Analytics)
- Configure uptime monitoring (UptimeRobot)

## Quick Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Build frontend
cd frontend
npm install
npm run build

# Prepare backend
cd ../backend
npm install

echo "Ready to deploy!"
echo "1. Push to GitHub"
echo "2. Deploy via your chosen platform"
```

## Domain Setup

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Point to your hosting:
   - Vercel: Add custom domain in dashboard
   - Render: Add custom domain in settings
   - VPS: Update DNS A record to server IP

## Cost Estimates

- **Vercel**: Free for personal use
- **Render**: Free with limitations (spins down after inactivity)
- **Firebase**: Free tier includes 1GB storage, 10GB/month transfer
- **Railway**: ~$5/month for small apps
- **VPS**: $5-10/month (DigitalOcean, Linode)