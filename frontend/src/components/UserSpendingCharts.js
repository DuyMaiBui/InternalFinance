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

// Daily spending trend chart for user
export const UserDailyChart = ({ expenses, dateRange, showAmounts = true }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Xu Hướng Chi Tiêu Hàng Ngày</h3>
        <p className="text-gray-500 text-center py-8">Không có dữ liệu chi tiêu</p>
      </div>
    );
  }

  // Process data to create daily spending chart
  const dailyData = {};
  const days = dateRange === 'all' ? 30 : parseInt(dateRange);
  
  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyData[dateKey] = {
      date: dateKey,
      total: 0
    };
  }

  // Add actual expenses
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const dateKey = date.toISOString().split('T')[0];
    if (dailyData[dateKey]) {
      dailyData[dateKey].total += expense.amount;
    }
  });

  const chartData = Object.values(dailyData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      total: item.total
    }));

  const formatCurrency = (value) => {
    if (!showAmounts) {
      return '••••••';
    }
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Xu Hướng Chi Tiêu Hàng Ngày</h3>
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
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Category breakdown pie chart for user
export const UserCategoryChart = ({ expenses, showAmounts = true }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi Tiêu Theo Danh Mục</h3>
        <p className="text-gray-500 text-center py-8">Không có dữ liệu chi tiêu</p>
      </div>
    );
  }

  // Group expenses by category
  const categoryData = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Khác';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += expense.amount;
  });

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount
  })).sort((a, b) => b.value - a.value);

  const formatCurrency = (value) => {
    if (!showAmounts) {
      return '••••••';
    }
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border rounded-lg shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-500">{showAmounts ? percentage + '%' : '••%'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Chi Tiêu Theo Danh Mục</h3>
      <div className="flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-2/3">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => showAmounts ? `${name} ${(percent * 100).toFixed(0)}%` : `${name} ••%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
          <div className="space-y-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Monthly spending comparison bar chart
export const UserMonthlyChart = ({ expenses, showAmounts = true }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chi Tiêu Theo Tháng</h3>
        <p className="text-gray-500 text-center py-8">Không có dữ liệu chi tiêu</p>
      </div>
    );
  }

  // Group expenses by month
  const monthlyData = {};
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        total: 0
      };
    }
    monthlyData[monthKey].total += expense.amount;
  });

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const formatCurrency = (value) => {
    if (!showAmounts) {
      return '••••••';
    }
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Chi Tiêu Theo Tháng</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => showAmounts ? `${(value/1000).toFixed(0)}k` : '••k'} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Summary statistics cards
export const UserStatsCards = ({ expenses, dateRange, showAmounts = true }) => {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = totalAmount / expenses.length;
  const days = dateRange === 'all' ? expenses.length : parseInt(dateRange);
  const dailyAverage = totalAmount / days;

  // Find most expensive category
  const categoryTotals = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Khác';
    categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const formatCurrency = (amount) => {
    if (!showAmounts) {
      return '••••••••';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const stats = [
    {
      title: 'Tổng Chi Tiêu',
      value: formatCurrency(totalAmount),
      color: 'bg-blue-500'
    },
    {
      title: 'Chi Tiêu Trung Bình',
      value: formatCurrency(averageExpense),
      color: 'bg-green-500'
    },
    {
      title: 'TB Mỗi Ngày',
      value: formatCurrency(dailyAverage),
      color: 'bg-yellow-500'
    },
    {
      title: 'Danh Mục Chính',
      value: showAmounts ? topCategory : '••••••',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white mr-4`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};