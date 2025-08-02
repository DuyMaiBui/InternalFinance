const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
try {
  // Use the service account JSON file directly
  const serviceAccount = require('../../firebase-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const db = admin.firestore();

module.exports = { admin, db };