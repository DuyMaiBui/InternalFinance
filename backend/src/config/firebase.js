const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
// You'll need to add your service account key to the .env file
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? 
  JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : 
  require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };