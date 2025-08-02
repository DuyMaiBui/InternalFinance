const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
try {
  let serviceAccount;
  
  // Check if we have environment variable for service account (production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Use the service account JSON file directly (development)
    serviceAccount = require('../../firebase-service-account.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const db = admin.firestore();

module.exports = { admin, db };