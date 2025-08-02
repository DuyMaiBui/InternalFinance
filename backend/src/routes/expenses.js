const express = require('express');
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Add expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, description, category, participants } = req.body;
    const userId = req.userId;

    // If no participants specified, default to all users
    let participantIds = participants;
    if (!participantIds || participantIds.length === 0) {
      const usersSnapshot = await db.collection('users').get();
      participantIds = usersSnapshot.docs.map(doc => doc.id);
    }

    const newExpense = {
      userId,
      amount: parseFloat(amount),
      description,
      category: category || 'Other',
      participants: participantIds, // Array of user IDs who share this expense
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
      
      // Get participant names if they exist
      let participantNames = [];
      if (expenseData.participants && expenseData.participants.length > 0) {
        for (const participantId of expenseData.participants) {
          const participantDoc = await db.collection('users').doc(participantId).get();
          if (participantDoc.exists) {
            participantNames.push(participantDoc.data().name);
          }
        }
      }
      
      expenses.push({
        id: doc.id,
        ...expenseData,
        user_name: userData.name || 'Unknown',
        user_color: userData.color || '#3B82F6',
        participant_names: participantNames
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
      
      // Get participant names if they exist
      let participantNames = [];
      if (expenseData.participants && expenseData.participants.length > 0) {
        for (const participantId of expenseData.participants) {
          const participantDoc = await db.collection('users').doc(participantId).get();
          if (participantDoc.exists) {
            participantNames.push(participantDoc.data().name);
          }
        }
      }
      
      expenses.push({
        id: doc.id,
        ...expenseData,
        user_name: userData.name || 'Unknown',
        user_color: userData.color || '#3B82F6',
        participant_names: participantNames
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

// Get spending statistics for 7 and 30 days
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    // Get all expenses in the date range
    const expensesSnapshot = await db.collection('expenses')
      .where('date', '>=', startDate.toISOString())
      .where('date', '<=', endDate.toISOString())
      .orderBy('date', 'asc')
      .get();
    
    // Get all users for mapping
    const usersSnapshot = await db.collection('users').get();
    const users = {};
    usersSnapshot.forEach(doc => {
      users[doc.id] = doc.data();
    });
    
    // Group by day
    const dailyData = {};
    let totalAmount = 0;
    
    expensesSnapshot.forEach(doc => {
      const expense = doc.data();
      const date = new Date(expense.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          total: 0,
          byUser: {},
          byCategory: {}
        };
      }
      
      // Add to daily total
      dailyData[dateKey].total += expense.amount;
      totalAmount += expense.amount;
      
      // Group by user
      const userName = users[expense.userId]?.name || 'Unknown';
      if (!dailyData[dateKey].byUser[userName]) {
        dailyData[dateKey].byUser[userName] = 0;
      }
      dailyData[dateKey].byUser[userName] += expense.amount;
      
      // Group by category
      const category = expense.category || 'Other';
      if (!dailyData[dateKey].byCategory[category]) {
        dailyData[dateKey].byCategory[category] = 0;
      }
      dailyData[dateKey].byCategory[category] += expense.amount;
    });
    
    // Fill in missing days with zero
    const dailyArray = [];
    for (let i = 0; i < daysNum; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dailyData[dateKey]) {
        dailyArray.unshift(dailyData[dateKey]);
      } else {
        dailyArray.unshift({
          date: dateKey,
          total: 0,
          byUser: {},
          byCategory: {}
        });
      }
    }
    
    // Calculate category totals
    const categoryTotals = {};
    expensesSnapshot.forEach(doc => {
      const expense = doc.data();
      const category = expense.category || 'Other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += expense.amount;
    });
    
    // Calculate user totals
    const userTotals = {};
    expensesSnapshot.forEach(doc => {
      const expense = doc.data();
      const userName = users[expense.userId]?.name || 'Unknown';
      const userColor = users[expense.userId]?.color || '#3B82F6';
      if (!userTotals[userName]) {
        userTotals[userName] = {
          total: 0,
          color: userColor
        };
      }
      userTotals[userName].total += expense.amount;
    });
    
    res.json({
      period: `${daysNum} days`,
      totalAmount,
      dailyData: dailyArray,
      categoryTotals,
      userTotals,
      averageDaily: totalAmount / daysNum
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, participants, date } = req.body;
    const userId = req.userId;
    
    // Get the expense to check ownership
    const expenseDoc = await db.collection('expenses').doc(id).get();
    
    if (!expenseDoc.exists) {
      return res.status(404).json({ error: 'Chi tiêu không tồn tại' });
    }
    
    const expenseData = expenseDoc.data();
    
    // Cho phép tất cả mọi người sửa chi tiêu của bất kỳ ai
    // Không cần kiểm tra quyền nữa
    
    // Prepare update data
    const updateData = {
      amount: parseFloat(amount),
      description,
      category: category || 'Other',
      participants: participants || expenseData.participants,
      date: date || expenseData.date,
      updatedAt: new Date().toISOString()
    };
    
    // Update the expense
    await db.collection('expenses').doc(id).update(updateData);
    
    res.json({ id, message: 'Chi tiêu đã được cập nhật' });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Get the expense to check ownership
    const expenseDoc = await db.collection('expenses').doc(id).get();
    
    if (!expenseDoc.exists) {
      return res.status(404).json({ error: 'Chi tiêu không tồn tại' });
    }
    
    const expenseData = expenseDoc.data();
    
    // Cho phép tất cả mọi người xóa chi tiêu của bất kỳ ai
    // Không cần kiểm tra quyền nữa
    
    // Delete the expense
    await db.collection('expenses').doc(id).delete();
    
    res.json({ message: 'Chi tiêu đã được xóa' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get rankings by period
router.get('/rankings', authenticate, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        // Start of current week (Monday)
        const dayOfWeek = startDate.getDay();
        const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(startDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Start of current month
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        break;
      case 'quarter':
        // Start of current quarter
        const quarter = Math.floor(startDate.getMonth() / 3);
        startDate = new Date(startDate.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        // Start of current year
        startDate = new Date(startDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    console.log(`Rankings period: ${period}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);

    // For debugging, let's always get all recent expenses first
    console.log('Getting all recent expenses for debugging...');
    let expensesSnapshot;
    try {
      // First, get all recent expenses to see what's in the database
      expensesSnapshot = await db.collection('expenses')
        .orderBy('date', 'desc')
        .limit(100)
        .get();
      
      console.log(`Found ${expensesSnapshot.size} total expenses in database`);
      
      // Log some sample expenses for debugging
      if (expensesSnapshot.size > 0) {
        const firstExpense = expensesSnapshot.docs[0].data();
        console.log('Sample expense:', {
          amount: firstExpense.amount,
          date: firstExpense.date,
          userId: firstExpense.userId,
          description: firstExpense.description
        });
      }
      
      // Now try to filter by date range if we have expenses
      if (expensesSnapshot.size > 0 && (period === 'week' || period === 'month' || period === 'quarter' || period === 'year')) {
        console.log('Trying to filter by date range...');
        const filteredSnapshot = await db.collection('expenses')
          .where('date', '>=', startDate.toISOString())
          .where('date', '<=', endDate.toISOString())
          .get();
        
        console.log(`Found ${filteredSnapshot.size} expenses in date range (${startDate.toISOString()} to ${endDate.toISOString()})`);
        
        // If date filter returns no results, use all expenses for debugging
        if (filteredSnapshot.size === 0) {
          console.log('Date range filter returned no results, using all expenses for ranking');
        } else {
          expensesSnapshot = filteredSnapshot;
        }
      }
      
    } catch (error) {
      console.error('Error querying expenses:', error);
      // Fallback to getting all recent expenses
      expensesSnapshot = await db.collection('expenses')
        .orderBy('date', 'desc')
        .limit(100)
        .get();
    }

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = {};
    usersSnapshot.forEach(doc => {
      users[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    console.log(`Found ${usersSnapshot.size} users in database`);
    Object.values(users).forEach(user => {
      console.log(`User: ${user.name} (${user.id})`);
    });

    // Initialize user stats for all users first
    const userStats = {};
    Object.values(users).forEach(user => {
      userStats[user.id] = {
        userId: user.id,
        name: user.name || 'Unknown',
        color: user.color || '#3B82F6',
        totalAmount: 0,
        expenseCount: 0,
        categories: {}
      };
    });

    const categoryStats = {};

    // Process expenses and add to user stats
    expensesSnapshot.forEach(doc => {
      const expense = doc.data();
      const userId = expense.userId;
      const category = expense.category || 'Khác';

      // Skip if user doesn't exist
      if (!userStats[userId]) {
        console.log(`Warning: Expense found for unknown user ${userId}`);
        return;
      }

      // Add to user totals
      userStats[userId].totalAmount += expense.amount;
      userStats[userId].expenseCount += 1;

      // Track categories per user
      if (!userStats[userId].categories[category]) {
        userStats[userId].categories[category] = 0;
      }
      userStats[userId].categories[category] += expense.amount;

      // Track global category stats
      if (!categoryStats[category]) {
        categoryStats[category] = 0;
      }
      categoryStats[category] += expense.amount;
    });

    // Find top category for each user
    Object.values(userStats).forEach(user => {
      const categories = Object.entries(user.categories);
      if (categories.length > 0) {
        const topCategory = categories.sort((a, b) => b[1] - a[1])[0];
        user.topCategory = topCategory[0];
      } else {
        user.topCategory = 'N/A';
      }
    });

    // Sort users by total amount (descending), but include all users
    const rankings = Object.values(userStats)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    console.log(`Returning ${rankings.length} users in rankings`);
    rankings.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}: ${user.totalAmount} VND (${user.expenseCount} expenses)`);
    });

    // Ensure we always return at least some data
    if (rankings.length === 0) {
      console.log('No rankings calculated, this should not happen as we initialize all users');
      // This is a fallback - should not happen with our new logic
      const fallbackRankings = Object.values(users).map(user => ({
        userId: user.id,
        name: user.name,
        color: user.color || '#3B82F6',
        totalAmount: 0,
        expenseCount: 0,
        categories: {},
        topCategory: 'N/A'
      }));
      console.log(`Returning ${fallbackRankings.length} fallback users`);
      return res.json(fallbackRankings);
    }

    res.json(rankings);
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({ message: 'Expenses routes working!', timestamp: new Date().toISOString() });
});

// Test endpoint to check data (no auth for debugging)
router.get('/test-data', async (req, res) => {
  try {
    console.log('=== TEST DATA ENDPOINT ===');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Get all expenses
    const expensesSnapshot = await db.collection('expenses')
      .orderBy('date', 'desc')
      .limit(10)
      .get();
    
    const expenses = [];
    expensesSnapshot.forEach(doc => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    const result = {
      users: users,
      expenses: expenses,
      userCount: users.length,
      expenseCount: expenses.length
    };
    
    console.log('Test data result:', result);
    res.json(result);
  } catch (error) {
    console.error('Test data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single expense
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const expenseDoc = await db.collection('expenses').doc(id).get();
    
    if (!expenseDoc.exists) {
      return res.status(404).json({ error: 'Chi tiêu không tồn tại' });
    }
    
    const expenseData = expenseDoc.data();
    
    // Get user data
    const userDoc = await db.collection('users').doc(expenseData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // Get participant names
    let participantNames = [];
    if (expenseData.participants && expenseData.participants.length > 0) {
      for (const participantId of expenseData.participants) {
        const participantDoc = await db.collection('users').doc(participantId).get();
        if (participantDoc.exists) {
          participantNames.push(participantDoc.data().name);
        }
      }
    }
    
    res.json({
      id: expenseDoc.id,
      ...expenseData,
      user_name: userData.name || 'Unknown',
      user_color: userData.color || '#3B82F6',
      participant_names: participantNames
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;