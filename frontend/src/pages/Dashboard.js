import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { SpendingSummaryCard, DailySpendingChart, CategoryPieChart, UserSpendingChart } from '../components/SpendingChart';
import { LoadingPage, LoadingSkeleton } from '../components/LoadingSpinner';

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics7Days, setStatistics7Days] = useState(null);
  const [statistics30Days, setStatistics30Days] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, expensesRes, usersRes, stats7Res, stats30Res] = await Promise.all([
        api.get('/api/expenses/summary'),
        api.get('/api/expenses'),
        api.get('/api/users'),
        api.get('/api/expenses/statistics?days=7'),
        api.get('/api/expenses/statistics?days=30')
      ]);

      setSummary(summaryRes.data);
      setRecentExpenses(expensesRes.data.slice(0, 5));
      setUsers(usersRes.data);
      setStatistics7Days(stats7Res.data);
      setStatistics30Days(stats30Res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = summary.reduce((acc, user) => acc + (user.total || 0), 0);
  const perPersonShare = users.length > 0 ? totalSpent / users.length : 0;

  // Calculate payment balances
  const calculateBalances = () => {
    const balances = summary.map(user => ({
      ...user,
      balance: (user.total || 0) - perPersonShare
    }));
    return balances;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingPage text="Đang tải bảng điều khiển..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Bảng Điều Khiển</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {statistics7Days && (
              <SpendingSummaryCard
                title="Chi tiêu 7 ngày"
                amount={statistics7Days.totalAmount}
                period="7 ngày qua"
              />
            )}
            {statistics30Days && (
              <SpendingSummaryCard
                title="Chi tiêu 30 ngày"
                amount={statistics30Days.totalAmount}
                period="30 ngày qua"
              />
            )}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tổng Chi Tiêu (30 ngày)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(totalSpent)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Mỗi Người Phải Trả
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(perPersonShare)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Số Thành Viên
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.length} người
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {statistics7Days && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
              <DailySpendingChart data={statistics7Days.dailyData} />
              <CategoryPieChart data={statistics7Days.categoryTotals} />
            </div>
          )}

          {statistics30Days && (
            <div className="mb-8">
              <UserSpendingChart data={statistics30Days.userTotals} />
            </div>
          )}

          {/* Family Members Summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Chi Tiêu Theo Thành Viên & Thanh Toán
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {calculateBalances().map((user, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.count || 0} chi tiêu</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Đã chi: {formatCurrency(user.total || 0)}
                      </p>
                      <p className={`text-sm font-medium ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {user.balance >= 0 ? 'Được nhận' : 'Cần trả'}: {formatCurrency(Math.abs(user.balance))}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Chi Tiêu Gần Đây
              </h3>
              <Link
                to="/expenses"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Xem tất cả
              </Link>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentExpenses.map((expense) => (
                <li key={expense.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: expense.user_color }}
                      >
                        {expense.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">{expense.user_name} • {expense.category}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;