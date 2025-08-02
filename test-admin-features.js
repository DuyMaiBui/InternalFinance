import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Test admin functionality
async function testAdminFeatures() {
  console.log('Testing Admin Features...\n');
  
  try {
    // 1. Check if admin exists
    console.log('1. Checking if admin exists...');
    const checkResponse = await axios.get(`${API_URL}/auth/check-admin`);
    console.log('Has Admin:', checkResponse.data.hasAdmin);
    
    if (!checkResponse.data.hasAdmin) {
      // 2. Create first admin
      console.log('\n2. Creating first admin...');
      const adminData = {
        name: 'Admin',
        pin: '123456'
      };
      
      const adminResponse = await axios.post(`${API_URL}/auth/register/admin`, adminData);
      console.log('Admin created:', adminResponse.data);
      
      // Store admin token
      const adminToken = adminResponse.data.token;
      
      // 3. Try to create another admin (should fail)
      console.log('\n3. Trying to create another admin (should fail)...');
      try {
        await axios.post(`${API_URL}/auth/register/admin`, {
          name: 'Admin2',
          pin: '654321'
        });
      } catch (error) {
        console.log('Expected error:', error.response.data.error);
      }
      
      // 4. Create regular users using admin token
      console.log('\n4. Creating regular users with admin token...');
      const users = [
        { name: 'User1', pin: '1111', color: '#10B981', role: 'user' },
        { name: 'User2', pin: '2222', color: '#F59E0B', role: 'user' }
      ];
      
      for (const user of users) {
        const response = await axios.post(`${API_URL}/auth/register`, user, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`Created ${user.name}:`, response.data);
      }
      
      // 5. Get all users
      console.log('\n5. Getting all users...');
      const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('All users:');
      usersResponse.data.forEach(user => {
        console.log(`  - ${user.name} (${user.role}) [${user.id}]`);
      });
      
      // 6. Try to delete a user
      console.log('\n6. Deleting a user...');
      const userToDelete = usersResponse.data.find(u => u.name === 'User2');
      if (userToDelete) {
        const deleteResponse = await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Delete response:', deleteResponse.data);
      }
      
    } else {
      console.log('\nAdmin already exists. Testing login...');
      
      // Login as existing admin
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        name: 'Admin',
        pin: '123456'
      });
      console.log('Admin login successful:', {
        name: loginResponse.data.name,
        role: loginResponse.data.role
      });
      
      const adminToken = loginResponse.data.token;
      
      // Get current users
      console.log('\nGetting current users...');
      const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Current users:');
      usersResponse.data.forEach(user => {
        console.log(`  - ${user.name} (${user.role}) [${user.id}]`);
      });
    }
    
    console.log('\n✅ Admin features test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testAdminFeatures();