const express = require('express');
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all users (family members)
router.get('/', authenticate, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.name,
        color: userData.color
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;