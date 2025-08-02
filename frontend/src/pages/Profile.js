import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { 
  UserDailyChart, 
  UserCategoryChart, 
  UserMonthlyChart,
  UserStatsCards 
} from '../components/UserSpendingCharts';
import RankBadge from '../components/RankBadge';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [showAmounts, setShowAmounts] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [showExpenseDetails, setShowExpenseDetails] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    loadPrivacySettings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserExpenses();
    }
  }, [user, dateRange]);

  // Load privacy settings from localStorage
  const loadPrivacySettings = () => {
    const savedShowAmounts = localStorage.getItem('profile_showAmounts');
    const savedShowUserInfo = localStorage.getItem('profile_showUserInfo');
    const savedShowExpenseDetails = localStorage.getItem('profile_showExpenseDetails');
    
    if (savedShowAmounts !== null) setShowAmounts(JSON.parse(savedShowAmounts));
    if (savedShowUserInfo !== null) setShowUserInfo(JSON.parse(savedShowUserInfo));
    if (savedShowExpenseDetails !== null) setShowExpenseDetails(JSON.parse(savedShowExpenseDetails));
  };

  // Save privacy settings to localStorage
  const savePrivacySetting = (key, value) => {
    localStorage.setItem(`profile_${key}`, JSON.stringify(value));
  };

  const toggleShowAmounts = () => {
    const newValue = !showAmounts;
    setShowAmounts(newValue);
    savePrivacySetting('showAmounts', newValue);
  };

  const toggleShowUserInfo = () => {
    const newValue = !showUserInfo;
    setShowUserInfo(newValue);
    savePrivacySetting('showUserInfo', newValue);
  };

  const toggleShowExpenseDetails = () => {
    const newValue = !showExpenseDetails;
    setShowExpenseDetails(newValue);
    savePrivacySetting('showExpenseDetails', newValue);
  };

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await api.get('/api/users/me');
      console.log('Profile response:', response.data);
      setUser(response.data);
      setFormData({
        ...formData,
        name: response.data.name,
        color: response.data.color
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', error.response);
      // Don't navigate to login immediately, let user see the error
      setLoading(false);
    }
  };

  const fetchUserExpenses = async () => {
    try {
      setExpensesLoading(true);
      
      let url = '/api/expenses';
      if (dateRange !== 'all') {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - parseInt(dateRange));
        url = `/api/expenses/range?start=${start.toISOString()}&end=${end.toISOString()}`;
      }
      
      const response = await api.get(url);
      // Filter expenses for current user only
      const userExpenses = response.data.filter(expense => expense.userId === user.id);
      setExpenses(userExpenses);
    } catch (error) {
      console.error('Error fetching user expenses:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        color: formData.color
      };

      // Only include PIN change if user entered current PIN
      if (formData.currentPin) {
        if (!formData.newPin || !formData.confirmPin) {
          alert('Vui lòng nhập mã PIN mới và xác nhận');
          return;
        }
        
        if (formData.newPin !== formData.confirmPin) {
          alert('Mã PIN mới và xác nhận không khớp');
          return;
        }

        if (formData.newPin.length < 4 || formData.newPin.length > 6) {
          alert('Mã PIN phải từ 4-6 số');
          return;
        }

        updateData.currentPin = formData.currentPin;
        updateData.newPin = formData.newPin;
      }

      const response = await api.put('/api/users/profile', updateData);
      
      // Update localStorage if color changed
      if (response.data.color) {
        localStorage.setItem('userColor', response.data.color);
      }
      
      setUser(response.data);
      setIsEditing(false);
      
      // Reset PIN fields
      setFormData({
        ...formData,
        currentPin: '',
        newPin: '',
        confirmPin: ''
      });
      
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật thông tin');
    }
  };

  const generateRandomColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
    ];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setFormData({ ...formData, color: newColor });
  };

  const handleDeleteExpense = async (expenseId, expenseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi tiêu "${expenseName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/expenses/${expenseId}`);
      fetchUserExpenses();
      alert('Chi tiêu đã được xóa');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa chi tiêu');
    }
  };

  const handleEditExpense = (expense) => {
    // Navigate to expense list with edit modal
    navigate('/expenses', { state: { editExpense: expense } });
  };

  const formatCurrency = (amount) => {
    if (!showAmounts) {
      return '••••••••';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const maskSensitiveInfo = (info) => {
    if (!showUserInfo) {
      return '••••••••';
    }
    return info;
  };

  const maskExpenseDescription = (description) => {
    if (!showExpenseDetails) {
      return '••••••••';
    }
    return description;
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Thông Tin Cá Nhân</h1>
            <div className="flex items-center space-x-4">
              {/* Privacy Controls */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Ẩn/Hiện:</span>
                <button
                  onClick={toggleShowUserInfo}
                  className={`px-3 py-1 rounded-full text-xs ${
                    showUserInfo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  title="Ẩn/hiện thông tin cá nhân"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showUserInfo ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"} />
                  </svg>
                  Info
                </button>
                <button
                  onClick={toggleShowAmounts}
                  className={`px-3 py-1 rounded-full text-xs ${
                    showAmounts 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  title="Ẩn/hiện số tiền"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAmounts ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"} />
                  </svg>
                  Tiền
                </button>
                <button
                  onClick={toggleShowExpenseDetails}
                  className={`px-3 py-1 rounded-full text-xs ${
                    showExpenseDetails 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  title="Ẩn/hiện chi tiết chi tiêu"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showExpenseDetails ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"} />
                  </svg>
                  Chi tiết
                </button>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            {!isEditing ? (
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
                    <div className="mt-2">
                      <RankBadge 
                        totalAmount={totalExpenses} 
                        showDetails={showAmounts} 
                        size="md"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID người dùng</label>
                      <p className="mt-1 text-sm text-gray-900">{maskSensitiveInfo(user.id)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Màu đại diện</label>
                      <div className="mt-1 flex items-center">
                        <div 
                          className={`w-6 h-6 rounded-full border ${!showUserInfo ? 'bg-gray-400' : ''}`}
                          style={{ backgroundColor: showUserInfo ? user.color : '#9CA3AF' }}
                        ></div>
                        <span className="ml-2 text-sm text-gray-900">{maskSensitiveInfo(user.color)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {showUserInfo ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '••/••/••••'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {showUserInfo ? (user.role === 'admin' ? 'Quản trị viên' : 'Người dùng thường') : '••••••••'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="p-6">
                <div className="mb-6">
                  <div className="flex items-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: formData.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-6">
                      <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu đại diện
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="h-10 w-20 border rounded cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={generateRandomColor}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Ngẫu nhiên
                      </button>
                      <span className="text-sm text-gray-600">{formData.color}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mã PIN</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Để giữ nguyên mã PIN hiện tại, hãy để trống các trường bên dưới
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã PIN hiện tại
                        </label>
                        <input
                          type="password"
                          maxLength="6"
                          value={formData.currentPin}
                          onChange={(e) => setFormData({...formData, currentPin: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập PIN hiện tại"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã PIN mới
                        </label>
                        <input
                          type="password"
                          maxLength="6"
                          value={formData.newPin}
                          onChange={(e) => setFormData({...formData, newPin: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập PIN mới (4-6 số)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xác nhận PIN mới
                        </label>
                        <input
                          type="password"
                          maxLength="6"
                          value={formData.confirmPin}
                          onChange={(e) => setFormData({...formData, confirmPin: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập lại PIN mới"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        color: user.color,
                        currentPin: '',
                        newPin: '',
                        confirmPin: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Statistics Section */}
          {expenses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thống Kê Chi Tiêu</h2>
              
              {/* Stats Cards */}
              <UserStatsCards expenses={expenses} dateRange={dateRange} showAmounts={showAmounts} />
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <UserDailyChart expenses={expenses} dateRange={dateRange} showAmounts={showAmounts} />
                <UserCategoryChart expenses={expenses} showAmounts={showAmounts} />
              </div>
              
              {/* Monthly Chart */}
              <div className="mb-6">
                <UserMonthlyChart expenses={expenses} showAmounts={showAmounts} />
              </div>
            </div>
          )}

          {/* Expense History Section */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Lịch Sử Chi Tiêu Của Tôi</h3>
                <div className="flex items-center space-x-4">
                  <div>
                    <select
                      className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="7">7 ngày qua</option>
                      <option value="30">30 ngày qua</option>
                      <option value="90">90 ngày qua</option>
                      <option value="all">Tất cả</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng chi tiêu</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Hiển thị {expenses.length} chi tiêu trong {dateRange === 'all' ? 'tất cả thời gian' : `${dateRange} ngày qua`}
                </p>
              </div>
            </div>

            <div className="p-6">
              {expensesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không có chi tiêu nào trong khoảng thời gian này</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mô Tả
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Danh Mục
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chia Với
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số Tiền
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao Tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {maskExpenseDescription(expense.description)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {showExpenseDetails ? expense.category : '••••••'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {showExpenseDetails ? (
                              expense.participant_names && expense.participant_names.length > 0
                                ? expense.participant_names.join(', ')
                                : 'Tất cả'
                            ) : '••••••'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEditExpense(expense)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Sửa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id, expense.description)}
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
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;