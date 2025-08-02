import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkCurrentUser();
    fetchUsers();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await api.get('/api/users/me');
      setCurrentUser(response.data);
      
      // Redirect if not admin
      if (response.data.role !== 'admin') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      navigate('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"? Tất cả chi tiêu của họ cũng sẽ bị xóa.`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers();
      alert('Đã xóa người dùng');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa người dùng');
    }
  };


  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
          </div>


          {/* Users List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Danh Sách Người Dùng ({users.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          {user.role === 'admin' && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Admin
                            </span>
                          )}
                          {user.id === currentUser.id && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Bạn
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 rounded hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chỉ Admin mới có thể xóa người dùng</li>
              <li>• Khi xóa người dùng, tất cả chi tiêu của họ cũng sẽ bị xóa</li>
              <li>• Admin không thể xóa chính mình</li>
              <li>• Mỗi người dùng có một màu riêng để dễ phân biệt</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;