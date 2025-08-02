import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ExpenseList from './pages/ExpenseList';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import SpendingHistory from './pages/SpendingHistory';
import Rankings from './pages/Rankings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />
          } />
          <Route path="/" element={
            isAuthenticated ? <SpendingHistory /> : <Navigate to="/login" />
          } />
          <Route path="/expenses" element={
            isAuthenticated ? <ExpenseList /> : <Navigate to="/login" />
          } />
          <Route path="/rankings" element={
            isAuthenticated ? <Rankings /> : <Navigate to="/login" />
          } />
          <Route path="/users" element={
            isAuthenticated ? <UserManagement /> : <Navigate to="/login" />
          } />
          <Route path="/profile" element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" />
          } />
          <Route path="/history" element={
            isAuthenticated ? <SpendingHistory /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;