import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export const DailySpendingChart = ({ data, showAmounts = true }) => {
  console.log('DailySpendingChart data:', data);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Xu hướng chi tiêu hàng ngày</h3>
        <p className="text-gray-500 text-center">Không có dữ liệu</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatCurrency = (value) => {
    if (!showAmounts) {
      return '••••••••';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  try {
    const chartData = data.map(day => ({
      date: formatDate(day.date),
      total: day.total || 0
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Xu hướng chi tiêu hàng ngày</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => showAmounts ? `${(value/1000).toFixed(0)}k` : '••k'} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering DailySpendingChart:', error);
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Xu hướng chi tiêu hàng ngày</h3>
        <p className="text-red-500 text-center">Lỗi khi hiển thị biểu đồ</p>
      </div>
    );
  }
};

export const CategoryPieChart = ({ data, showAmounts = true, showDetails = true }) => {
  console.log('CategoryPieChart data:', data);
  
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h3>
        <p className="text-gray-500 text-center">Không có dữ liệu</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (!showAmounts) {
      return '••••••••';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  try {
    const chartData = Object.entries(data).map(([category, amount]) => ({
      name: showDetails ? category : '••••••',
      value: amount || 0
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => showAmounts && showDetails ? `${name} ${(percent * 100).toFixed(0)}%` : '••'}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering CategoryPieChart:', error);
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h3>
        <p className="text-red-500 text-center">Lỗi khi hiển thị biểu đồ</p>
      </div>
    );
  }
};

export const UserSpendingChart = ({ data, showAmounts = true, showDetails = true }) => {
  console.log('UserSpendingChart data:', data);
  
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo thành viên</h3>
        <p className="text-gray-500 text-center">Không có dữ liệu</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (!showAmounts) {
      return '••••••••';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  try {
    const chartData = Object.entries(data).map(([user, info]) => ({
      name: showDetails ? user : '••••••',
      amount: info.total || 0,
      fill: info.color || '#3B82F6'
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo thành viên</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => showAmounts ? `${(value/1000).toFixed(0)}k` : '••k'} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="amount">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering UserSpendingChart:', error);
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo thành viên</h3>
        <p className="text-red-500 text-center">Lỗi khi hiển thị biểu đồ</p>
      </div>
    );
  }
};

export const SpendingSummaryCard = ({ title, amount, period, change }) => {
  const isPositive = change > 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">
          ${amount.toFixed(2)}
        </p>
        {change !== undefined && (
          <span className={`ml-2 text-sm ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">{period}</p>
    </div>
  );
};