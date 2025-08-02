import React, { useState, useEffect } from 'react';
import api from '../services/api';

function EditExpenseModal({ expense, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: '',
    participants: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      // Convert ISO date to date input format
      const dateValue = expense.date ? expense.date.split('T')[0] : '';
      
      setFormData({
        amount: expense.amount || '',
        description: expense.description || '',
        category: expense.category || 'Other',
        date: dateValue,
        participants: expense.participants || []
      });
    }
    fetchUsers();
  }, [expense]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      alert('Vui lòng nhập số tiền và mô tả');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        date: formData.date ? new Date(formData.date + 'T00:00:00').toISOString() : expense.date
      };
      
      await api.put(`/api/expenses/${expense.id}`, updateData);
      onUpdate();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật chi tiêu');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Healthcare', 'Education', 'Bills', 'Other'
  ];

  if (!expense) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Sửa Chi Tiêu</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày chi tiêu
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chia sẻ với
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.participants.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          participants: [...formData.participants, user.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          participants: formData.participants.filter(id => id !== user.id)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">
                    {user.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;