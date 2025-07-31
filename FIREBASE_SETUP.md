# Firebase Setup Instructions

To use Firestore with this application, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter a project name (e.g., "family-expense-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

## 3. Get Service Account Key

1. Go to Project Settings (gear icon) > Service accounts
2. Click "Generate new private key"
3. Save the downloaded JSON file

## 4. Configure the Application

### Option A: Using Environment Variable (Recommended)
1. Copy the contents of your service account JSON file
2. Add to your `backend/.env` file:
```
FIREBASE_SERVICE_ACCOUNT='paste-your-json-content-here'
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

### Option B: Using JSON File
1. Save the service account JSON file as `backend/firebase-service-account.json`
2. Add this file to your `.gitignore` to keep it secure

## 5. Create Firestore Indexes (Important!)

For the date range queries to work properly, create this composite index:

1. Go to Firestore Database > Indexes
2. Click "Create Index"
3. Add these fields:
   - Collection ID: `expenses`
   - Fields to index:
     - Field path: `date` (Ascending)
     - Field path: `__name__` (Ascending)
4. Click "Create"

## 6. Install Dependencies and Run

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Run the application
cd ..
npm run dev
```

## Security Rules (Optional)

For better security, you can add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all data
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Users can only create expenses for themselves
    match /expenses/{expense} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users collection
    match /users/{user} {
      allow write: if request.auth != null;
    }
  }
}
```

Note: The current implementation uses JWT tokens, not Firebase Auth. To use these rules, you'd need to implement Firebase Auth.