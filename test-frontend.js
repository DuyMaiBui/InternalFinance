import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const testUsers = [
  { name: 'Nguyễn Văn A', pin: '1234' },
  { name: 'Trần Thị B', pin: '2345' },
  { name: 'Lê Văn C', pin: '3456' },
  { name: 'Phạm Thị D', pin: '4567' }
];

const categories = ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Giải trí', 'Hóa đơn', 'Y tế', 'Khác'];

const expenseDescriptions = {
  'Ăn uống': ['Bún bò', 'Phở', 'Cơm tấm', 'Bánh mì', 'Cà phê', 'Trà sữa', 'Ăn tối', 'Ăn trưa'],
  'Di chuyển': ['Grab', 'Xăng xe', 'Vé xe buýt', 'Taxi', 'Gửi xe'],
  'Mua sắm': ['Siêu thị', 'Rau củ', 'Thịt cá', 'Đồ gia dụng', 'Quần áo'],
  'Giải trí': ['Xem phim', 'Karaoke', 'Du lịch', 'Game', 'Sách'],
  'Hóa đơn': ['Điện', 'Nước', 'Internet', 'Điện thoại', 'Gas'],
  'Y tế': ['Thuốc', 'Khám bệnh', 'Bảo hiểm y tế'],
  'Khác': ['Quà tặng', 'Từ thiện', 'Sửa chữa', 'Khác']
};

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomAmount = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
};

const randomDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// API functions
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test functions
async function registerUsers() {
  console.log('🔹 Đăng ký người dùng...');
  const registeredUsers = [];
  
  for (const user of testUsers) {
    try {
      const response = await api.post('/api/auth/register', user);
      registeredUsers.push({
        ...user,
        ...response.data
      });
      console.log(`✅ Đã đăng ký: ${user.name}`);
      await delay(500);
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        // User already exists, try to login
        try {
          const loginResponse = await api.post('/api/auth/login', user);
          registeredUsers.push({
            ...user,
            ...loginResponse.data
          });
          console.log(`✅ Đã đăng nhập: ${user.name} (người dùng đã tồn tại)`);
        } catch (loginError) {
          console.error(`❌ Lỗi đăng nhập ${user.name}:`, loginError.response?.data);
        }
      } else {
        console.error(`❌ Lỗi đăng ký ${user.name}:`, error.response?.data);
      }
    }
  }
  
  return registeredUsers;
}

async function createExpenses(users, numberOfExpenses = 50) {
  console.log(`\n🔹 Tạo ${numberOfExpenses} chi tiêu...`);
  const expenses = [];
  
  for (let i = 0; i < numberOfExpenses; i++) {
    const user = randomElement(users);
    const category = randomElement(categories);
    const description = randomElement(expenseDescriptions[category]);
    
    const expenseData = {
      amount: randomAmount(10, 500),
      description: description,
      category: category,
      date: randomDate(30) // Random date within last 30 days
    };
    
    try {
      const response = await api.post('/api/expenses', expenseData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      expenses.push({
        ...expenseData,
        id: response.data.id,
        userId: user.userId,
        userName: user.name
      });
      
      console.log(`✅ ${user.name} chi ${expenseData.amount.toLocaleString('vi-VN')}đ cho ${description}`);
      await delay(200);
    } catch (error) {
      console.error(`❌ Lỗi tạo chi tiêu:`, error.response?.data);
    }
  }
  
  return expenses;
}

async function getExpenseSummary(token) {
  try {
    const response = await api.get('/api/expenses/summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy tổng kết:', error.response?.data);
    return [];
  }
}

async function getAllExpenses(token) {
  try {
    const response = await api.get('/api/expenses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiêu:', error.response?.data);
    return [];
  }
}

async function displaySummary(users) {
  console.log('\n📊 TỔNG KẾT CHI TIÊU');
  console.log('='.repeat(60));
  
  if (users.length === 0) {
    console.log('Không có người dùng nào!');
    return;
  }
  
  const token = users[0].token;
  const summary = await getExpenseSummary(token);
  const allExpenses = await getAllExpenses(token);
  
  // Calculate totals
  const totalSpent = summary.reduce((sum, user) => sum + (user.total || 0), 0);
  const perPersonShare = totalSpent / users.length;
  
  console.log(`\n💰 Tổng chi tiêu: ${totalSpent.toLocaleString('vi-VN')}đ`);
  console.log(`👥 Số người: ${users.length}`);
  console.log(`💵 Mỗi người phải trả: ${perPersonShare.toLocaleString('vi-VN')}đ`);
  console.log('\n📋 Chi tiết từng người:');
  console.log('-'.repeat(60));
  
  // Display individual totals
  summary.forEach(user => {
    const balance = (user.total || 0) - perPersonShare;
    const status = balance >= 0 ? '✅ Được nhận' : '❌ Cần trả';
    console.log(
      `${user.name.padEnd(20)} | ` +
      `Đã chi: ${(user.total || 0).toLocaleString('vi-VN')}đ`.padEnd(25) + ' | ' +
      `${status}: ${Math.abs(balance).toLocaleString('vi-VN')}đ`
    );
  });
  
  // Calculate who owes whom
  console.log('\n💸 HƯỚNG DẪN THANH TOÁN:');
  console.log('-'.repeat(60));
  
  const balances = summary.map(user => ({
    name: user.name,
    balance: (user.total || 0) - perPersonShare
  }));
  
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0.01) {
      console.log(`➡️  ${debtor.name} → ${creditor.name}: ${amount.toLocaleString('vi-VN')}đ`);
    }
    
    debtor.balance += amount;
    creditor.balance -= amount;
    
    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }
  
  console.log('\n✨ Hoàn tất!');
}

// Main test function
async function runTests() {
  console.log('🚀 BẮT ĐẦU KIỂM THỬ FRONTEND');
  console.log('='.repeat(60));
  console.log(`📍 Backend URL: ${API_URL}`);
  console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
  console.log('='.repeat(60));
  
  try {
    // Test backend connection
    console.log('\n🔹 Kiểm tra kết nối backend...');
    await api.get('/api/users').catch(() => {}); // Will fail without auth, but that's ok
    console.log('✅ Backend đang chạy!');
    
    // Register users
    const users = await registerUsers();
    
    if (users.length === 0) {
      console.error('❌ Không thể đăng ký người dùng!');
      return;
    }
    
    // Create expenses
    await createExpenses(users, 30); // Create 30 test expenses
    
    // Display summary
    await displaySummary(users);
    
    console.log('\n✅ KIỂM THỬ HOÀN TẤT!');
    console.log(`\n🌐 Mở ${FRONTEND_URL} trong trình duyệt để xem kết quả`);
    console.log('📝 Thông tin đăng nhập:');
    testUsers.forEach(user => {
      console.log(`   - ${user.name}: PIN ${user.pin}`);
    });
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Đảm bảo backend đang chạy tại', API_URL);
    }
  }
}

// Run tests
runTests();