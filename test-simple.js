import axios from 'axios';

// Simple test script for InternalFinance
const API_URL = 'http://localhost:5001';

// Test users
const users = [
  { name: 'Anh', pin: '1111' },
  { name: 'Bình', pin: '2222' },
  { name: 'Cường', pin: '3333' }
];

// Helper to create API instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

async function test() {
  console.log('🧪 Testing InternalFinance...\n');
  
  try {
    // 1. Register/Login users
    console.log('1️⃣ Registering users...');
    const tokens = [];
    
    for (const user of users) {
      try {
        // Try to register
        const res = await api.post('/api/auth/register', user);
        tokens.push({ ...user, token: res.data.token });
        console.log(`✅ Registered: ${user.name}`);
      } catch (err) {
        // If user exists, login
        const res = await api.post('/api/auth/login', user);
        tokens.push({ ...user, token: res.data.token });
        console.log(`✅ Logged in: ${user.name}`);
      }
    }
    
    // 2. Add some expenses
    console.log('\n2️⃣ Adding expenses...');
    
    // User 1: 200k
    await api.post('/api/expenses', 
      { amount: 150000, description: 'Bún bò', category: 'Ăn uống' },
      { headers: { Authorization: `Bearer ${tokens[0].token}` }}
    );
    await api.post('/api/expenses', 
      { amount: 50000, description: 'Cà phê', category: 'Ăn uống' },
      { headers: { Authorization: `Bearer ${tokens[0].token}` }}
    );
    console.log(`✅ ${users[0].name}: 200,000đ`);
    
    // User 2: 300k
    await api.post('/api/expenses', 
      { amount: 300000, description: 'Siêu thị', category: 'Mua sắm' },
      { headers: { Authorization: `Bearer ${tokens[1].token}` }}
    );
    console.log(`✅ ${users[1].name}: 300,000đ`);
    
    // User 3: 100k
    await api.post('/api/expenses', 
      { amount: 100000, description: 'Xăng xe', category: 'Di chuyển' },
      { headers: { Authorization: `Bearer ${tokens[2].token}` }}
    );
    console.log(`✅ ${users[2].name}: 100,000đ`);
    
    // 3. Show results
    console.log('\n3️⃣ Summary:');
    console.log('Total: 600,000đ');
    console.log('Per person: 200,000đ');
    console.log('\nPayments needed:');
    console.log('- Anh: Already paid 200k ✅');
    console.log('- Bình: Paid 300k, gets back 100k');
    console.log('- Cường: Paid 100k, owes 100k to Bình');
    
    console.log('\n✅ Test complete!');
    console.log('\n🌐 Open http://localhost:3000');
    console.log('📝 Login with:');
    users.forEach(u => console.log(`   ${u.name}: PIN ${u.pin}`));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();