import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import ExpenseSplitTable from '../components/ExpenseSplitTable';
import ExpenseSpreadsheet from '../components/ExpenseSpreadsheet';
import EditExpenseModal from '../components/EditExpenseModal';
import { LoadingSkeleton, LoadingSpinner } from '../components/LoadingSpinner';

function ExpenseList() {
  const location = useLocation();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [viewMode, setViewMode] = useState('spreadsheet'); // 'table' or 'spreadsheet'
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));
  
  useEffect(() => {
    setCurrentUserId(localStorage.getItem('userId'));
    setCurrentUserRole(localStorage.getItem('userRole'));
  }, []);
  const [currentUserRole, setCurrentUserRole] = useState(localStorage.getItem('userRole'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Check if we need to open edit modal from navigation state
  useEffect(() => {
    if (location.state?.editExpense) {
      setEditingExpense(location.state.editExpense);
      // Clear the state to prevent reopening modal on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchExpenses(), fetchUsers()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      let url = '/api/expenses';
      if (dateRange !== 'all') {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - parseInt(dateRange));
        url = `/api/expenses/range?start=${start.toISOString()}&end=${end.toISOString()}`;
      }
      
      const response = await api.get(url);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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

  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(e => e.user_name === filter);

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const uniqueUsers = [...new Set(expenses.map(e => e.user_name))];

  const handleDelete = async (expenseId, expenseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi tiêu "${expenseName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/expenses/${expenseId}`);
      fetchExpenses();
      alert('Chi tiêu đã được xóa');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa chi tiêu');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const canEditDelete = (expense) => {
    // Tất cả mọi người có thể sửa/xóa chi tiêu của bất kỳ ai
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiêu Gia Đình</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('spreadsheet')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'spreadsheet' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Excel
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Bảng Chia Tiền
              </button>
            </div>
          </div>
          
          {/* Filters - hide in spreadsheet mode */}
          {viewMode !== 'spreadsheet' && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời Gian
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="7">7 ngày qua</option>
                  <option value="30">30 ngày qua</option>
                  <option value="90">90 ngày qua</option>
                  <option value="all">Tất cả</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành Viên
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-right w-full">
                  <p className="text-sm text-gray-500">Tổng cộng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Content based on view mode */}
          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <LoadingSkeleton rows={8} />
            </div>
          ) : viewMode === 'spreadsheet' ? (
            <ExpenseSpreadsheet 
              expenses={filteredExpenses} 
              users={users} 
              onExpenseAdded={fetchExpenses}
              onExpenseDeleted={fetchExpenses}
              onExpenseEdited={handleEdit}
            />
          ) : (
            <ExpenseSplitTable expenses={filteredExpenses} users={users} onExpenseDeleted={fetchExpenses} onExpenseEdited={handleEdit} />
          )}
        </div>
      </main>
      
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onUpdate={() => {
            setEditingExpense(null);
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
}

export default ExpenseList;