import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = React.useState(localStorage.getItem('userName'));
  const [userColor, setUserColor] = React.useState(localStorage.getItem('userColor'));
  const [userRole, setUserRole] = React.useState(localStorage.getItem('userRole'));
  
  // Update state when localStorage changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName'));
      setUserColor(localStorage.getItem('userColor'));
      setUserRole(localStorage.getItem('userRole'));
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Debug log
  console.log('Navigation - userRole:', userRole);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h2 className="text-xl font-bold text-gray-900">Chi Tiêu Gia Đình</h2>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Lịch sử chi tiêu
              </Link>
              <Link
                to="/expenses"
                className={`${
                  isActive('/expenses') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Tất Cả Chi Tiêu
              </Link>
              <Link
                to="/rankings"
                className={`${
                  isActive('/rankings') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Xếp Hạng
              </Link>
              {userRole === 'admin' && (
                <Link
                  to="/users"
                  className={`${
                    isActive('/users') 
                      ? 'border-blue-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Quản Lý
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/profile"
              className="flex items-center mr-4 hover:text-gray-900"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2"
                style={{ backgroundColor: userColor || '#3B82F6' }}
              >
                {userName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 hover:text-gray-900">{userName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Lịch sử chi tiêu
          </Link>
          <Link
            to="/expenses"
            className={`${
              isActive('/expenses') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            All Expenses
          </Link>
          {userRole === 'admin' && (
            <Link
              to="/users"
              className={`${
                isActive('/users') 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Quản Lý Người Dùng
            </Link>
          )}
          <Link
            to="/profile"
            className={`${
              isActive('/profile') 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2"
              style={{ backgroundColor: userColor || '#3B82F6' }}
            >
              {userName?.charAt(0).toUpperCase()}
            </div>
            Hồ Sơ Cá Nhân
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;