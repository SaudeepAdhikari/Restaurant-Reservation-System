import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { getToken, removeToken } from './utils/auth';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantsList from './pages/RestaurantsList';
import RestaurantForm from './pages/RestaurantForm';
import RestaurantDetails from './pages/RestaurantDetails';
import MenuList from './pages/MenuList';
import MenuForm from './pages/MenuForm';
import TablesList from './pages/TablesList';
import TableForm from './pages/TableForm';
import Bookings from './pages/Bookings';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import UploadMenu from './pages/UploadMenu';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // We need to create this

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        if (isMounted) setLoading(true);
        const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          if (isMounted) setToken('authenticated');
        } else {
          await removeToken();
          if (isMounted) setToken(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        await removeToken();
        if (isMounted) setToken(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    await removeToken();
    setToken(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuth={setToken} />} />
        <Route path="/signup" element={<Signup onAuth={setToken} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`main-wrapper ${!sidebarOpen ? 'expanded' : ''}`}>
        <AppHeader onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/restaurants" element={<RestaurantsList />} />
            <Route path="/restaurant/new" element={<RestaurantForm />} />
            <Route path="/restaurant/:id" element={<RestaurantForm />} />
            <Route path="/restaurant" element={<RestaurantDetails />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="/menu/new" element={<MenuForm />} />
            <Route path="/upload-menu" element={<UploadMenu />} />
            <Route path="/tables" element={<TablesList />} />
            <Route path="/tables/new" element={<TableForm />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppHeader({ onLogout, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = (path) => {
    if (path === '/') return 'Dashboard';
    if (path.includes('/restaurant')) return 'Restaurants';
    if (path.includes('/menu')) return 'Menu Management';
    if (path.includes('/tables')) return 'Tables';
    if (path.includes('/bookings')) return 'Bookings';
    if (path.includes('/offers')) return 'Offers';
    if (path.includes('/profile')) return 'Profile';
    return 'Owner Panel';
  };

  return (
    <Header
      title={getTitle(location.pathname)}
      onLogout={onLogout}
      onProfile={() => navigate('/profile')}
      toggleSidebar={toggleSidebar}
    />
  );
}

export default App;

