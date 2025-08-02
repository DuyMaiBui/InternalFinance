import axios from 'axios';

// Test Excel view functionality
const API_URL = 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

async function test() {
  console.log('🧪 Testing Excel View...\n');
  
  try {
    // Login as test user
    const loginRes = await api.post('/api/auth/login', {
      name: 'Test User',
      pin: '1234'
    });
    
    const token = loginRes.data.token;
    api.defaults.headers.Authorization = `Bearer ${token}`;
    
    console.log('✅ Logged in as Test User');
    
    // Add a few more test expenses
    const testExpenses = [
      { amount: 85000, description: 'Cà phê sáng', category: 'Ăn uống' },
      { amount: 120000, description: 'Grab đi làm', category: 'Di chuyển' },
      { amount: 250000, description: 'Mua rau chợ', category: 'Mua sắm' },
      { amount: 500000, description: 'Tiền điện', category: 'Hóa đơn' },
      { amount: 150000, description: 'Xem phim CGV', category: 'Giải trí' }
    ];
    
    console.log('\n📝 Adding test expenses...');
    for (const expense of testExpenses) {
      await api.post('/api/expenses', expense);
      console.log(`✅ Added: ${expense.description} - ${expense.amount.toLocaleString('vi-VN')}đ`);
    }
    
    console.log('\n✅ Test complete!');
    console.log('\n📊 To see the Excel view:');
    console.log('1. Open http://localhost:3000');
    console.log('2. Login with: Test User / PIN: 1234');
    console.log('3. Go to "Chi Tiêu Gia Đình"');
    console.log('4. Click "Excel" view button');
    console.log('\n💡 Features:');
    console.log('- Click "Thêm mới" to add expenses inline');
    console.log('- Click column headers to sort');
    console.log('- Use search box to filter');
    console.log('- Click "Xuất Excel" to download CSV');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();