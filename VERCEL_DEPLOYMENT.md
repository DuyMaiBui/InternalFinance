# Vercel Deployment Guide

## Prerequisites
1. [Vercel account](https://vercel.com) (free)
2. [Vercel CLI](https://vercel.com/cli) installed globally
3. Your Firebase service account JSON file

## Installation
```bash
npm i -g vercel
```

## Step-by-Step Deployment

### 1. Deploy Backend First

```bash
# Navigate to backend directory
cd backend

# Login to Vercel (first time only)
vercel login

# Deploy backend
vercel
```

**Follow the prompts:**
- Set up and deploy? `Y`
- Which scope? Choose your account
- Link to existing project? `N` (for first deployment)
- What's your project's name? `family-expense-backend`
- In which directory? `./` (current directory)
- Want to override settings? `N`

### 2. Configure Backend Environment Variables

After deployment, set environment variables in Vercel dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add these variables:

```
JWT_SECRET=your-strong-random-secret-key-here
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

**To get FIREBASE_SERVICE_ACCOUNT value:**
1. Open `backend/firebase-service-account.json`
2. Copy the entire JSON content as a single line
3. Paste it as the value for FIREBASE_SERVICE_ACCOUNT

### 3. Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Update the API URL with your backend URL
# Edit .env.production and replace with your actual backend URL
# Example: REACT_APP_API_URL=https://family-expense-backend.vercel.app

# Deploy frontend
vercel
```

**Follow the prompts:**
- Set up and deploy? `Y`
- Which scope? Choose your account  
- Link to existing project? `N` (for first deployment)
- What's your project's name? `family-expense-frontend`
- In which directory? `./` (current directory)
- Want to override settings? `N`

### 4. Update Frontend Environment Variables

1. Go to Vercel Dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add:

```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

Replace `your-backend-url` with the actual URL from step 1.

### 5. Redeploy Frontend

After updating environment variables:

```bash
# In frontend directory
vercel --prod
```

## Verification

1. Visit your frontend URL (provided by Vercel)
2. Try to register/login
3. Test creating expenses
4. Test the rankings page

## Troubleshooting

### Backend Issues
- Check Function Logs in Vercel Dashboard
- Verify environment variables are set correctly
- Ensure Firebase service account JSON is valid

### Frontend Issues
- Check build logs in Vercel Dashboard
- Verify REACT_APP_API_URL is set correctly
- Check browser console for errors

### Common Problems

**CORS Issues:**
Backend CORS is configured for all origins. If you get CORS errors, check the browser console.

**Authentication Issues:**
- Clear localStorage in browser
- Check if backend is receiving requests
- Verify JWT_SECRET is set in backend

**Firebase Issues:**
- Verify service account has proper permissions
- Check Firestore rules allow read/write
- Ensure project ID matches in service account

## URLs After Deployment

After deployment, you'll have:
- **Backend**: `https://family-expense-backend.vercel.app`
- **Frontend**: `https://family-expense-frontend.vercel.app`

## Custom Domain (Optional)

1. Go to your frontend project in Vercel Dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables Summary

### Backend (.env or Vercel Dashboard)
```
JWT_SECRET=your-strong-secret-key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Frontend (.env.production or Vercel Dashboard)
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## Updating Your App

### Backend Updates
```bash
cd backend
vercel --prod
```

### Frontend Updates
```bash
cd frontend
vercel --prod
```

## Security Notes

1. **Never commit** `firebase-service-account.json` to git
2. Use strong `JWT_SECRET` (at least 32 characters)
3. Consider setting up Firestore security rules
4. Enable HTTPS only (Vercel does this by default)

## Cost

Vercel is free for:
- Hobby projects
- Up to 100GB bandwidth/month
- Unlimited static sites
- 100 serverless functions executions/day (Hobby plan)

For production apps with higher traffic, consider Vercel Pro plan.