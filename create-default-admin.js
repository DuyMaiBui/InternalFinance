const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('./internalfinance-16a16-firebase-adminsdk-fbsvc-091c068c04.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createDefaultAdmin() {
  try {
    console.log('Đang tạo tài khoản admin mặc định...\n');
    
    // Check if admin already exists
    const usersRef = db.collection('users');
    const adminSnapshot = await usersRef.where('role', '==', 'admin').get();
    
    if (!adminSnapshot.empty) {
      console.log('❌ Đã có admin trong hệ thống!');
      console.log('Danh sách admin hiện tại:');
      adminSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (ID: ${doc.id})`);
      });
      return;
    }
    
    // Create default admin
    const hashedPin = bcrypt.hashSync('123456', 8);
    
    const adminData = {
      name: 'Admin',
      pin: hashedPin,
      role: 'admin',
      color: '#DC2626', // Red color for admin
      createdAt: new Date().toISOString()
    };
    
    const docRef = await usersRef.add(adminData);
    
    console.log('✅ Tạo admin thành công!');
    console.log('\nThông tin đăng nhập:');
    console.log('- Tên: Admin');
    console.log('- Mã PIN: 123456');
    console.log('- ID:', docRef.id);
    console.log('\nBây giờ bạn có thể đăng nhập tại http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    process.exit();
  }
}

// Run the script
createDefaultAdmin();