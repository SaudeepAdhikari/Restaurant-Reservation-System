import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { getToken } from './utils/auth';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Restaurants from './pages/Restaurants';
import Customers from './pages/Customers';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [token, setToken] = useState(getToken());
  useEffect(() => {
    // verify token server-side on mount
    if (!token) return;
    (async () => {
      try {
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('invalid');
      } catch (err) {
        // invalid token — clear and show login
        localStorage.removeItem('admin_token');
        setToken(null);
      }
    })();
  }, []);
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuth={() => setToken(getToken())} />} />
        <Route path="/signup" element={<Signup onAuth={() => setToken(getToken())} />} />
        <Route path="*" element={<Login onAuth={() => setToken(getToken())} />} />
      </Routes>
    );
  }

  return (
    <div className="admin-app-layout">
      <Sidebar />
      <div className="admin-main-area">
        <Topbar />
        <main className="admin-main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
