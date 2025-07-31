const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, pin, color } = req.body;
    
    // Check if user already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('name', '==', name).get();
    
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPin = bcrypt.hashSync(pin, 8);
    
    // Create new user
    const newUser = {
      name,
      pin: hashedPin,
      color: color || '#3B82F6',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await usersRef.add(newUser);
    const token = jwt.sign({ id: docRef.id }, JWT_SECRET);
    
    res.json({ token, userId: docRef.id, name, color: newUser.color });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.body;
    
    // Find user by name
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('name', '==', name).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    const pinValid = bcrypt.compareSync(pin, userData.pin);
    if (!pinValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }
    
    const token = jwt.sign({ id: userDoc.id }, JWT_SECRET);
    res.json({ 
      token, 
      userId: userDoc.id, 
      name: userData.name, 
      color: userData.color 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;