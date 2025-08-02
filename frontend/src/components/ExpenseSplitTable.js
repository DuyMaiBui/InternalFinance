import React from 'react';

const ExpenseSplitTable = ({ expenses, users, onExpenseDeleted, onExpenseEdited }) => {
  
  const handleDelete = async (expenseId, expenseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi tiêu "${expenseName}"?`)) {
      return;
    }
    
    try {
      const api = (await import('../services/api')).default;
      await api.delete(`/api/expenses/${expenseId}`);
      onExpenseDeleted();
      alert('Chi tiêu đã được xóa');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa chi tiêu');
    }
  };
  // Calculate what each user owes based on participant-specific expenses
  const calculateUserDebts = () => {
    const userDebts = {};
    
    // Initialize user data
    users.forEach(user => {
      userDebts[user.id] = {
        id: user.id,
        name: user.name,
        color: user.color,
        totalPaid: 0,  // What they paid
        totalOwes: 0,  // What they owe for shared expenses
        expenses: []
      };
    });

    // Process each expense
    expenses.forEach(expense => {
      // Track who paid
      if (userDebts[expense.userId]) {
        userDebts[expense.userId].totalPaid += expense.amount;
        userDebts[expense.userId].expenses.push(expense);
      }

      // Calculate share for participants
      let participants = expense.participants || [];
      
      // If no participants specified, assume all users share
      if (participants.length === 0) {
        participants = users.map(u => u.id);
      }

      const sharePerPerson = expense.amount / participants.length;
      
      // Add to each participant's debt
      participants.forEach(participantId => {
        if (userDebts[participantId]) {
          userDebts[participantId].totalOwes += sharePerPerson;
        }
      });
    });

    // Calculate final balances
    const splits = {};
    Object.keys(userDebts).forEach(userId => {
      const user = userDebts[userId];
      splits[userId] = {
        ...user,
        balance: user.totalPaid - user.totalOwes  // Positive = should receive, Negative = should pay
      };
    });

    return splits;
  };

  const splits = calculateUserDebts();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Format currency in VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Chi Tiết Chi Tiêu và Chia Tiền</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tổng chi tiêu: {formatCurrency(totalExpenses)}
        </p>
      </div>

      {/* Expense History Table */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Lịch Sử Chi Tiêu</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người Chi
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
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: expense.user_color }}
                    >
                      {expense.user_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {expense.participant_names && expense.participant_names.length > 0
                      ? expense.participant_names.join(', ')
                      : 'Tất cả'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
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
          </table>
        </div>
      </div>

      {/* User Summary Table */}
      <div className="p-6 border-t">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Tổng Kết Theo Người</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người Dùng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đã Chi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phải Trả
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Dư
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.values(splits).map((user) => (
                <tr key={user.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(user.totalPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(user.totalOwes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <span className={user.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {user.balance >= 0 ? '+' : ''}{formatCurrency(user.balance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="p-6 bg-gray-50 border-t">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Hướng Dẫn Thanh Toán</h3>
        <div className="space-y-2">
          {(() => {
            const payments = [];
            const balances = Object.values(splits);
            
            // Find who owes money (negative balance) and who should receive (positive balance)
            const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
            const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
            
            let i = 0, j = 0;
            while (i < debtors.length && j < creditors.length) {
              const debtor = debtors[i];
              const creditor = creditors[j];
              const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
              
              if (amount > 0) {
                payments.push({
                  from: debtor.name,
                  to: creditor.name,
                  amount: amount
                });
              }
              
              debtor.balance += amount;
              creditor.balance -= amount;
              
              if (Math.abs(debtor.balance) < 0.01) i++;
              if (creditor.balance < 0.01) j++;
            }
            
            return payments.map((payment, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="font-medium">{payment.from}</span>
                <span className="text-gray-500">→</span>
                <span className="font-medium">{payment.to}</span>
                <span className="text-gray-500">:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(payment.amount)}</span>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSplitTable;