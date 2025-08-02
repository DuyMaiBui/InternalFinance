import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';

function Login({ setAuth }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if this is first admin setup
  React.useEffect(() => {
    const checkFirstAdmin = async () => {
      try {
        const response = await api.get('/api/auth/check-admin');
        setIsFirstAdmin(!response.data.hasAdmin);
        if (!response.data.hasAdmin) {
          setIsRegister(true); // Only allow registration for first admin
        } else {
          setIsRegister(false); // Force login mode for all other cases
        }
      } catch (error) {
        console.log('Error checking admin status');
        setIsRegister(false); // Default to login mode on error
      } finally {
        setLoading(false);
      }
    };
    checkFirstAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let endpoint;
      if (isFirstAdmin && isRegister) {
        endpoint = '/api/auth/register/admin';
      } else {
        endpoint = '/api/auth/login';
      }
      
      const data = isRegister ? { name, pin, color } : { name, pin };
      
      const response = await api.post(endpoint, data);
      
      // Debug log
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', response.data.name);
      localStorage.setItem('userColor', response.data.color);
      localStorage.setItem('userRole', response.data.role || 'user');
      
      setAuth(true);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Đang kiểm tra..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quản Lý Chi Tiêu Gia Đình
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isFirstAdmin ? 'Tạo Tài Khoản Admin Đầu Tiên' : (isRegister ? 'Tạo tài khoản của bạn' : 'Đăng nhập vào tài khoản')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mã PIN (4-6 số)"
                maxLength="6"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Màu của bạn
              </label>
              <input
                type="color"
                className="mt-1 block w-full h-10 rounded-md border-gray-300 cursor-pointer"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
            </button>
          </div>

          {/* User registration is disabled - only admin can create accounts */}
          {!isFirstAdmin && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Chỉ có admin mới có thể tạo tài khoản mới.<br />
                Vui lòng liên hệ admin để được cấp tài khoản.
              </p>
            </div>
          )}
        </form>
      </div>
      
      {submitting && <LoadingOverlay text={isRegister ? "Đang tạo tài khoản..." : "Đang đăng nhập..."} />}
    </div>
  );
}

export default Login;