import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { DailySpendingChart, CategoryPieChart, UserSpendingChart } from '../components/SpendingChart';

function SpendingHistory() {
  const [period, setPeriod] = useState(30);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
    loadPrivacySettings();
  }, [period]);

  // Load privacy settings from localStorage
  const loadPrivacySettings = () => {
    const savedShowAmounts = localStorage.getItem('spendingHistory_showAmounts');
    const savedShowDetails = localStorage.getItem('spendingHistory_showDetails');
    
    if (savedShowAmounts !== null) setShowAmounts(JSON.parse(savedShowAmounts));
    if (savedShowDetails !== null) setShowDetails(JSON.parse(savedShowDetails));
  };

  // Save privacy settings to localStorage
  const savePrivacySetting = (key, value) => {
    localStorage.setItem(`spendingHistory_${key}`, JSON.stringify(value));
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

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/expenses/statistics?days=${period}`);
      console.log('Statistics data:', response.data);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
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

  const periodOptions = [
    { value: 7, label: '7 ngày' },
    { value: 30, label: '30 ngày' },
    { value: 60, label: '60 ngày' },
    { value: 90, label: '90 ngày' },
    { value: 180, label: '180 ngày' },
    { value: 365, label: '1 năm' }
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
            <h1 className="text-3xl font-bold text-gray-900">Lịch Sử Chi Tiêu</h1>
            
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
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!statistics ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng chi tiêu
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatCurrency(statistics.totalAmount)}
                    </dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Trung bình/ngày
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatCurrency(statistics.averageDaily)}
                    </dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Số ngày thống kê
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {showDetails ? `${period} ngày` : '••••••'}
                    </dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Danh mục nhiều nhất
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {showDetails ? (
                        Object.entries(statistics.categoryTotals).length > 0 
                          ? Object.entries(statistics.categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
                          : 'N/A'
                      ) : '••••••••'}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {statistics.totalAmount === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-500">Không có dữ liệu chi tiêu trong khoảng thời gian này</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {statistics.dailyData && statistics.dailyData.length > 0 && (
                    <DailySpendingChart data={statistics.dailyData} showAmounts={showAmounts} />
                  )}
                  
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {statistics.categoryTotals && Object.keys(statistics.categoryTotals).length > 0 && (
                      <CategoryPieChart data={statistics.categoryTotals} showAmounts={showAmounts} showDetails={showDetails} />
                    )}
                    {statistics.userTotals && Object.keys(statistics.userTotals).length > 0 && (
                      <UserSpendingChart data={statistics.userTotals} showAmounts={showAmounts} showDetails={showDetails} />
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Daily Breakdown */}
              <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Chi tiết theo ngày
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng chi tiêu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chi tiết theo người
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statistics.dailyData.slice().reverse().map((day, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(day.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(day.total)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {Object.entries(day.byUser).map(([user, amount]) => (
                              <span key={user} className="inline-block mr-4">
                                {showDetails ? user : '••••••'}: {formatCurrency(amount)}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SpendingHistory;