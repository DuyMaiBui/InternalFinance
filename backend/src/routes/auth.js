const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Check if admin exists
router.get('/check-admin', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const adminSnapshot = await usersRef.where('role', '==', 'admin').get();
    
    res.json({ hasAdmin: !adminSnapshot.empty });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public register - only for initial admin setup
router.post('/register/admin', async (req, res) => {
  try {
    const { name, pin } = req.body;
    
    // Check if any admin exists
    const usersRef = db.collection('users');
    const adminSnapshot = await usersRef.where('role', '==', 'admin').get();
    
    if (!adminSnapshot.empty) {
      return res.status(403).json({ error: 'Admin already exists. Please login as admin to create new users.' });
    }
    
    const hashedPin = bcrypt.hashSync(pin, 8);
    
    // Create first admin user
    const newUser = {
      name,
      pin: hashedPin,
      role: 'admin',
      color: '#DC2626', // Red for admin
      createdAt: new Date().toISOString()
    };
    
    const docRef = await usersRef.add(newUser);
    const token = jwt.sign({ id: docRef.id, role: 'admin' }, JWT_SECRET);
    
    res.json({ 
      token, 
      userId: docRef.id, 
      name, 
      role: 'admin',
      color: newUser.color 
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Register new user - DISABLED
router.post('/register', authenticate, async (req, res) => {
  // User registration via admin is now disabled
  return res.status(403).json({ error: 'Tính năng tạo tài khoản mới đã bị vô hiệu hóa' });
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
    
    const token = jwt.sign({ 
      id: userDoc.id, 
      role: userData.role || 'user' 
    }, JWT_SECRET);
    
    res.json({ 
      token, 
      userId: userDoc.id, 
      name: userData.name, 
      role: userData.role || 'user',
      color: userData.color 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;