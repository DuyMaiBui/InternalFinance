#!/bin/bash

echo "🚀 Building Family Expense Tracker for deployment..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Prepare backend
echo "🔧 Preparing backend..."
cd ../backend
npm install

echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Choose your deployment platform (see DEPLOYMENT.md)"
echo "2. Update REACT_APP_API_URL in frontend/.env.production"
echo "3. Set environment variables on your hosting platform"
echo "4. Deploy both frontend and backend"
echo ""
echo "Environment variables needed:"
echo "- JWT_SECRET (backend)"
echo "- FIREBASE_SERVICE_ACCOUNT (backend)"
echo "- REACT_APP_API_URL (frontend)"