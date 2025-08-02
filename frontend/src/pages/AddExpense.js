import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';

function AddExpense() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Ăn uống');
  const [users, setUsers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 
    'Giải trí', 'Y tế', 'Giáo dục', 'Khác'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
      // Default to all users selected
      setSelectedParticipants(response.data.map(user => user.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedParticipants(users.map(user => user.id));
    } else {
      setSelectedParticipants([]);
    }
  };

  const handleParticipantToggle = (userId) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      const newParticipants = [...selectedParticipants, userId];
      setSelectedParticipants(newParticipants);
      setSelectAll(newParticipants.length === users.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedParticipants.length === 0) {
      alert('Vui lòng chọn ít nhất một người để chia tiền');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/api/expenses', { 
        amount: parseFloat(amount), 
        description, 
        category,
        participants: selectedParticipants
      });
      navigate('/');
    } catch (error) {
      alert('Lỗi khi thêm chi tiêu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Thêm Chi Tiêu</h1>
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Số tiền (VNĐ)
              </label>
              <input
                type="number"
                step="1000"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mô tả
              </label>
              <input
                type="text"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiêu cho cái gì?"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Danh mục
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Chia tiền với ai?
              </label>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner text="Đang tải danh sách..." />
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectAll}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span className="text-sm font-medium">Chọn tất cả</span>
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      {users.map(user => (
                    <label key={user.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedParticipants.includes(user.id)}
                        onChange={() => handleParticipantToggle(user.id)}
                      />
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name}
                      </span>
                    </label>
                      ))}
                    </div>
                    
                    {selectedParticipants.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        Mỗi người sẽ trả: {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(amount / selectedParticipants.length || 0)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Thêm Chi Tiêu
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {submitting && <LoadingOverlay text="Đang thêm chi tiêu..." />}
    </div>
  );
}

export default AddExpense;