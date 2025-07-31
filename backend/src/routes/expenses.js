const express = require('express');
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Add expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.userId;

    const newExpense = {
      userId,
      amount: parseFloat(amount),
      description,
      category: category || 'Other',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('expenses').add(newExpense);
    res.json({ id: docRef.id, message: 'Expense added' });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all expenses (for the group)
router.get('/', authenticate, async (req, res) => {
  try {
    // Get expenses with user data
    const expensesSnapshot = await db.collection('expenses')
      .orderBy('date', 'desc')
      .limit(100)
      .get();

    const expenses = [];
    
    for (const doc of expensesSnapshot.docs) {
      const expenseData = doc.data();
      
      // Get user data
      const userDoc = await db.collection('users').doc(expenseData.userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      expenses.push({
        id: doc.id,
        ...expenseData,
        user_name: userData.name || 'Unknown',
        user_color: userData.color || '#3B82F6'
      });
    }

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get expenses by date range
router.get('/range', authenticate, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const expensesSnapshot = await db.collection('expenses')
      .where('date', '>=', start)
      .where('date', '<=', end)
      .orderBy('date', 'desc')
      .get();

    const expenses = [];
    
    for (const doc of expensesSnapshot.docs) {
      const expenseData = doc.data();
      
      // Get user data
      const userDoc = await db.collection('users').doc(expenseData.userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      expenses.push({
        id: doc.id,
        ...expenseData,
        user_name: userData.name || 'Unknown',
        user_color: userData.color || '#3B82F6'
      });
    }

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses by range error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const summary = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Get expenses for this user in last 30 days
      const expensesSnapshot = await db.collection('expenses')
        .where('userId', '==', userDoc.id)
        .where('date', '>=', thirtyDaysAgoISO)
        .get();
      
      let total = 0;
      let count = 0;
      
      expensesSnapshot.forEach(doc => {
        const expense = doc.data();
        total += expense.amount;
        count++;
      });
      
      summary.push({
        name: userData.name,
        color: userData.color,
        total: total,
        count: count
      });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;