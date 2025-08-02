import axios from 'axios';

// Test script for participant-based expense splitting
const API_URL = 'http://localhost:5001';

// Test users
const users = [
  { name: 'An', pin: '1111' },
  { name: 'Bình', pin: '2222' },
  { name: 'Cường', pin: '3333' },
  { name: 'Dung', pin: '4444' }
];

// Helper to create API instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

async function test() {
  console.log('🧪 Testing Expense Splitting with Participants...\n');
  
  try {
    // 1. Register/Login users
    console.log('1️⃣ Setting up users...');
    const userTokens = [];
    
    for (const user of users) {
      try {
        const res = await api.post('/api/auth/register', user);
        userTokens.push({ ...user, ...res.data });
        console.log(`✅ Registered: ${user.name}`);
      } catch (err) {
        const res = await api.post('/api/auth/login', user);
        userTokens.push({ ...user, ...res.data });
        console.log(`✅ Logged in: ${user.name}`);
      }
    }
    
    // Get all user IDs
    const allUserIds = userTokens.map(u => u.userId);
    
    // 2. Add expenses with different participant combinations
    console.log('\n2️⃣ Adding expenses with specific participants...');
    
    // Example 1: An pays for lunch for everyone (400k total)
    await api.post('/api/expenses', 
      { 
        amount: 400000, 
        description: 'Ăn trưa nhà hàng', 
        category: 'Ăn uống',
        participants: allUserIds  // Everyone shares
      },
      { headers: { Authorization: `Bearer ${userTokens[0].token}` }}
    );
    console.log('✅ An paid 400k for lunch (shared by all 4 people)');
    
    // Example 2: Bình pays for movie tickets for Bình, Cường, Dung (300k total)
    await api.post('/api/expenses', 
      { 
        amount: 300000, 
        description: 'Vé xem phim', 
        category: 'Giải trí',
        participants: [userTokens[1].userId, userTokens[2].userId, userTokens[3].userId]  // Only 3 people
      },
      { headers: { Authorization: `Bearer ${userTokens[1].token}` }}
    );
    console.log('✅ Bình paid 300k for movies (shared by Bình, Cường, Dung - not An)');
    
    // Example 3: Cường pays for taxi for himself and An (100k total)
    await api.post('/api/expenses', 
      { 
        amount: 100000, 
        description: 'Taxi', 
        category: 'Di chuyển',
        participants: [userTokens[0].userId, userTokens[2].userId]  // Only An and Cường
      },
      { headers: { Authorization: `Bearer ${userTokens[2].token}` }}
    );
    console.log('✅ Cường paid 100k for taxi (shared by An and Cường only)');
    
    // Example 4: Dung buys groceries for the house (200k total)
    await api.post('/api/expenses', 
      { 
        amount: 200000, 
        description: 'Đi chợ', 
        category: 'Mua sắm',
        participants: allUserIds  // Everyone shares
      },
      { headers: { Authorization: `Bearer ${userTokens[3].token}` }}
    );
    console.log('✅ Dung paid 200k for groceries (shared by all)');
    
    // 3. Calculate who owes whom
    console.log('\n3️⃣ Expense Summary:');
    console.log('─'.repeat(60));
    console.log('An:');
    console.log('  - Paid: 400k (lunch for all)');
    console.log('  - Owes: 100k (lunch) + 50k (taxi) + 50k (groceries) = 200k');
    console.log('  - Balance: +200k (should receive)');
    
    console.log('\nBình:');
    console.log('  - Paid: 300k (movies)');
    console.log('  - Owes: 100k (lunch) + 100k (movies) + 50k (groceries) = 250k');
    console.log('  - Balance: +50k (should receive)');
    
    console.log('\nCường:');
    console.log('  - Paid: 100k (taxi)');
    console.log('  - Owes: 100k (lunch) + 100k (movies) + 50k (taxi) + 50k (groceries) = 300k');
    console.log('  - Balance: -200k (should pay)');
    
    console.log('\nDung:');
    console.log('  - Paid: 200k (groceries)');
    console.log('  - Owes: 100k (lunch) + 100k (movies) + 50k (groceries) = 250k');
    console.log('  - Balance: -50k (should pay)');
    
    console.log('\n💸 Payment Instructions:');
    console.log('─'.repeat(60));
    console.log('➡️  Cường pays An: 200k');
    console.log('➡️  Dung pays Bình: 50k');
    
    console.log('\n✅ Test complete!');
    console.log('\n🌐 Open http://localhost:3000');
    console.log('📝 Login and check "Bảng Chia Tiền" to see the calculations');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();