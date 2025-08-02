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
        role: userData.role || 'user',
        color: userData.color
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticate, async (req, res) => {
  try {
    // Check if requester is admin
    const requesterDoc = await db.collection('users').doc(req.userId).get();
    const requesterData = requesterDoc.data();
    
    if (requesterData.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có thể xóa tài khoản' });
    }
    
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Không thể xóa chính mình' });
    }
    
    // Check if user exists
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    
    // Delete user
    await db.collection('users').doc(userId).delete();
    
    // Optionally delete user's expenses
    const expensesSnapshot = await db.collection('expenses')
      .where('userId', '==', userId)
      .get();
    
    const batch = db.batch();
    expensesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    res.json({ 
      success: true, 
      message: 'Đã xóa người dùng và các chi tiêu liên quan' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    res.json({
      id: userDoc.id,
      name: userData.name,
      role: userData.role || 'user',
      color: userData.color,
      createdAt: userData.createdAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { color, currentPin, newPin } = req.body;
    const userRef = db.collection('users').doc(req.userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    
    const userData = userDoc.data();
    const updateData = {};
    
    // Update color if provided
    if (color) {
      updateData.color = color;
    }
    
    // Update PIN if current PIN is correct
    if (currentPin && newPin) {
      const bcrypt = require('bcryptjs');
      
      // Verify current PIN
      const isValidPin = bcrypt.compareSync(currentPin, userData.pin);
      if (!isValidPin) {
        return res.status(401).json({ error: 'Mã PIN hiện tại không đúng' });
      }
      
      // Hash new PIN
      updateData.pin = bcrypt.hashSync(newPin, 8);
    }
    
    // Update user document
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toISOString();
      await userRef.update(updateData);
    }
    
    // Return updated user data
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    res.json({
      id: updatedDoc.id,
      name: updatedData.name,
      role: updatedData.role || 'user',
      color: updatedData.color,
      createdAt: updatedData.createdAt,
      updatedAt: updatedData.updatedAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;