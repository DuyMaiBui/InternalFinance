import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ExpenseSpreadsheet = ({ expenses, users, onExpenseAdded, onExpenseDeleted, onExpenseEdited }) => {
  
  const handleDelete = async (expenseId, expenseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi tiêu "${expenseName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/expenses/${expenseId}`);
      if (onExpenseDeleted) onExpenseDeleted();
      alert('Chi tiêu đã được xóa');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa chi tiêu');
    }
  };
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'Ăn uống',
    participants: users.map(u => u.id),
    date: new Date().toISOString().split('T')[0]
  });
  const [isAdding, setIsAdding] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filter, setFilter] = useState('');

  const categories = [
    'Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 
    'Giải trí', 'Y tế', 'Giáo dục', 'Khác'
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle sorting
  const sortedExpenses = [...expenses].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'amount') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Handle filtering
  const filteredExpenses = sortedExpenses.filter(expense => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      expense.description.toLowerCase().includes(searchLower) ||
      expense.user_name.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      (expense.participant_names && expense.participant_names.join(' ').toLowerCase().includes(searchLower))
    );
  });

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Handle adding new expense
  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      alert('Vui lòng nhập số tiền và mô tả');
      return;
    }

    try {
      await api.post('/api/expenses', {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date).toISOString()
      });
      
      // Reset form
      setNewExpense({
        amount: '',
        description: '',
        category: 'Ăn uống',
        participants: users.map(u => u.id),
        date: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      
      // Refresh data
      if (onExpenseAdded) onExpenseAdded();
    } catch (error) {
      alert('Lỗi khi thêm chi tiêu');
    }
  };

  // Handle participant toggle for new expense
  const toggleParticipant = (userId) => {
    if (newExpense.participants.includes(userId)) {
      setNewExpense({
        ...newExpense,
        participants: newExpense.participants.filter(id => id !== userId)
      });
    } else {
      setNewExpense({
        ...newExpense,
        participants: [...newExpense.participants, userId]
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Ngày', 'Người chi', 'Mô tả', 'Danh mục', 'Chia với', 'Số tiền'];
    const rows = filteredExpenses.map(exp => [
      formatDate(exp.date),
      exp.user_name,
      exp.description,
      exp.category,
      exp.participant_names ? exp.participant_names.join(', ') : 'Tất cả',
      exp.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chi-tieu-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Bảng Chi Tiêu</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng: <span className="font-semibold">{formatCurrency(totalAmount)} VNĐ</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm mới
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Search/Filter */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortField('date');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Ngày {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người chi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chia với
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortField('amount');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Số tiền {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add new expense row */}
            {isAdding && (
              <tr className="bg-yellow-50">
                <td className="px-4 py-3">
                  <input
                    type="date"
                    className="w-full px-2 py-1 border rounded"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {localStorage.getItem('userName')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="Mô tả..."
                    className="w-full px-2 py-1 border rounded"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-full px-2 py-1 border rounded"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {users.map(user => (
                      <label 
                        key={user.id}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={newExpense.participants.includes(user.id)}
                          onChange={() => toggleParticipant(user.id)}
                        />
                        <span 
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Số tiền..."
                      className="w-24 px-2 py-1 border rounded text-right"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                    <button
                      onClick={handleAddExpense}
                      className="text-green-600 hover:text-green-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {/* Empty cell for add row */}
                </td>
              </tr>
            )}

            {/* Expense rows */}
            {filteredExpenses.map((expense, index) => (
              <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full text-white"
                    style={{ backgroundColor: expense.user_color }}
                  >
                    {expense.user_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {expense.category}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {expense.participant_names && expense.participant_names.length > 0
                    ? expense.participant_names.join(', ')
                    : 'Tất cả'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(expense.amount)} ₫
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onExpenseEdited(expense)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Sửa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id, expense.description)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Total row */}
          <tfoot className="bg-gray-100">
            <tr>
              <td colSpan="6" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                Tổng cộng:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                {formatCurrency(totalAmount)} ₫
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ExpenseSpreadsheet;