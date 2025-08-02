import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Interceptor - URL:', config.url);
    console.log('API Interceptor - Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Interceptor - Added Authorization header');
    } else {
      console.log('API Interceptor - No token found');
    }
    return config;
  },
  (error) => {
    console.error('API Interceptor - Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Status:', response.status);
    console.log('API Response - Data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Response - Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;