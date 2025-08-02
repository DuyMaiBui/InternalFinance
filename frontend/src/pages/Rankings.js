import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import RankBadge from '../components/RankBadge';
import { getAllRanks, formatRankRange } from '../utils/rankUtils';

function Rankings() {
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'quarter', 'year'
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRankings();
    loadPrivacySettings();
  }, [period]);

  // Load privacy settings from localStorage
  const loadPrivacySettings = () => {
    const savedShowAmounts = localStorage.getItem('rankings_showAmounts');
    const savedShowDetails = localStorage.getItem('rankings_showDetails');
    
    if (savedShowAmounts !== null) setShowAmounts(JSON.parse(savedShowAmounts));
    if (savedShowDetails !== null) setShowDetails(JSON.parse(savedShowDetails));
  };

  // Save privacy settings to localStorage
  const savePrivacySetting = (key, value) => {
    localStorage.setItem(`rankings_${key}`, JSON.stringify(value));
  };

  const toggleShowAmounts = () => {
    const newValue = !showAmounts;
    setShowAmounts(newValue);
    savePrivacySetting('showAmounts', newValue);
  };

  const toggleShowDetails = () => {
    const newValue = !showDetails;
    setShowDetails(newValue);
    savePrivacySetting('showDetails', newValue);
  };

  const fetchRankings = async () => {
    try {
      setLoading(true);
      
      // Check authentication first
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log('Auth check - Token exists:', !!token);
      console.log('Auth check - User ID:', userId);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      console.log(`Fetching rankings for period: ${period}`);
      const response = await api.get(`/api/expenses/rankings?period=${period}`);
      console.log('Rankings API response:', response.data);
      console.log('Rankings length:', response.data?.length || 0);
      
      // Ensure we always have an array
      const rankingsData = Array.isArray(response.data) ? response.data : [];
      setRankings(rankingsData);
      
      if (rankingsData.length === 0) {
        console.log('No rankings data received');
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error config:', error.config);
      
      // Set empty array on error to prevent crashes
      setRankings([]);
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('Network error - backend may not be running');
        alert('Lỗi kết nối: Không thể kết nối tới server. Vui lòng kiểm tra backend có đang chạy không.');
      } else {
        console.error('Failed to fetch rankings, showing empty state');
        alert(`Lỗi khi tải dữ liệu xếp hạng: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
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

  const maskDetails = (info) => {
    if (!showDetails) {
      return '••••••••';
    }
    return info;
  };

  const getPeriodLabel = () => {
    const labels = {
      'week': 'Tuần này',
      'month': 'Tháng này', 
      'quarter': 'Quý này',
      'year': 'Năm này'
    };
    return labels[period] || 'Không xác định';
  };

  const getPeriodDescription = () => {
    const descriptions = {
      'week': 'Từ thứ 2 đến Chủ nhật',
      'month': 'Từ đầu tháng đến hiện tại',
      'quarter': 'Từ đầu quý đến hiện tại', 
      'year': 'Từ đầu năm đến hiện tại'
    };
    return descriptions[period] || '';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full">
          <span className="text-lg">🏆</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full">
          <span className="text-lg">🥈</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full">
          <span className="text-lg">🥉</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full font-bold">
          {rank}
        </div>
      );
    }
  };

  const periodOptions = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    { value: 'year', label: 'Năm' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bảng Xếp Hạng Chi Tiêu</h1>
              <p className="text-gray-600 mt-2">{getPeriodDescription()}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Privacy Controls */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Ẩn/Hiện:</span>
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
                  onClick={toggleShowDetails}
                  className={`px-3 py-1 rounded-full text-xs ${
                    showDetails 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  title="Ẩn/hiện chi tiết"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showDetails ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"} />
                  </svg>
                  Chi tiết
                </button>
              </div>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!rankings || rankings.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Không có dữ liệu xếp hạng
              </h2>
              <div className="text-center space-y-4">
                <p className="text-gray-500">
                  Không có dữ liệu chi tiêu trong {getPeriodLabel().toLowerCase()}
                </p>
                <div className="text-sm text-gray-400">
                  <p>Debug info:</p>
                  <p>Period: {period}</p>
                  <p>Rankings length: {rankings?.length || 0}</p>
                  <p>Thử chuyển sang khoảng thời gian khác hoặc kiểm tra có chi tiêu nào chưa</p>
                </div>
                <div className="space-x-2">
                  <button 
                    onClick={fetchRankings}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Tải lại
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        console.log('Testing rankings endpoint directly...');
                        console.log('API base URL:', api.defaults.baseURL);
                        
                        // Test a simple GET request first
                        const response = await api.get('/api/expenses/rankings?period=month');
                        console.log('Rankings response:', response.data);
                        alert(`Success! Got ${response.data?.length || 0} users in rankings`);
                      } catch (error) {
                        console.error('Rankings test error:', error);
                        console.error('Error response:', error.response);
                        console.error('Error status:', error.response?.status);
                        console.error('Error data:', error.response?.data);
                        
                        if (error.response?.status === 404) {
                          alert('404 Error - Endpoint not found. Check backend routes.');
                        } else if (error.response?.status === 401) {
                          alert('401 Error - Authentication failed. Check token.');
                        } else {
                          alert(`Test failed: ${error.response?.status || 'Unknown'} - ${error.message}`);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Test Rankings
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rank Legend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Hệ Thống Xếp Hạng Theo Mức Chi Tiêu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAllRanks().map((rank) => (
                    <div key={rank.level} className="flex items-center p-3 rounded-lg border" style={{ backgroundColor: rank.bgColor, borderColor: rank.color }}>
                      <span className="text-2xl mr-3">{rank.icon}</span>
                      <div>
                        <div className="font-semibold" style={{ color: rank.textColor }}>
                          {rank.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {showAmounts ? formatRankRange(rank) : '••••••••'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rank.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 3 Podium */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Top 3 Chi Tiêu {getPeriodLabel()}
                </h2>
                <div className="flex justify-center items-end space-x-4">
                  {rankings.slice(0, 3).map((user, index) => {
                    const actualRank = index + 1;
                    const heights = ['h-32', 'h-40', 'h-28']; // 2nd, 1st, 3rd
                    const orders = [1, 0, 2]; // Display order: 2nd, 1st, 3rd
                    const displayIndex = orders.indexOf(index);
                    
                    return (
                      <div key={user.userId} className={`flex flex-col items-center ${displayIndex === 1 ? 'order-2' : displayIndex === 0 ? 'order-1' : 'order-3'}`}>
                        <div className={`${heights[displayIndex]} ${
                          actualRank === 1 ? 'bg-yellow-400' : 
                          actualRank === 2 ? 'bg-gray-300' : 
                          'bg-orange-400'
                        } rounded-t-lg w-24 flex flex-col justify-end items-center p-4 shadow-lg`}>
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2"
                            style={{ backgroundColor: showDetails ? user.color : '#9CA3AF' }}
                          >
                            {showDetails ? user.name.charAt(0).toUpperCase() : '•'}
                          </div>
                          <div className="text-white text-center">
                            <div className="text-xs font-semibold">{actualRank === 1 ? '🏆' : actualRank === 2 ? '🥈' : '🥉'}</div>
                            <div className="text-xs">{maskDetails(user.name)}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <div className="mb-2">
                            <RankBadge 
                              totalAmount={user.totalAmount} 
                              showDetails={showDetails && showAmounts} 
                              size="sm"
                            />
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(user.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {showDetails ? `${user.expenseCount} chi tiêu` : '•• chi tiêu'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Rankings Table */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bảng Xếp Hạng Đầy Đủ - {getPeriodLabel()}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hạng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành Viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng Chi Tiêu
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số Chi Tiêu
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trung Bình/Chi Tiêu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Danh Mục Chính
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rankings.map((user, index) => {
                        const rank = index + 1;
                        const avgPerExpense = user.expenseCount > 0 ? user.totalAmount / user.expenseCount : 0;
                        
                        return (
                          <tr key={user.userId} className={rank <= 3 ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRankIcon(rank)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                                  style={{ backgroundColor: showDetails ? user.color : '#9CA3AF' }}
                                >
                                  {showDetails ? user.name.charAt(0).toUpperCase() : '•'}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {maskDetails(user.name)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <RankBadge 
                                totalAmount={user.totalAmount} 
                                showDetails={showDetails && showAmounts} 
                                size="sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(user.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                              {showDetails ? user.expenseCount : '••'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {formatCurrency(avgPerExpense)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {showDetails ? (user.topCategory || 'N/A') : '••••••'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tổng Chi Tiêu</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(rankings.reduce((sum, user) => sum + user.totalAmount, 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Số Chi Tiêu</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {showDetails ? rankings.reduce((sum, user) => sum + user.expenseCount, 0) : '••••'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Thành Viên Tham Gia</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {showDetails ? rankings.length : '••'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Rankings;