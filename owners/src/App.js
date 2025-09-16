import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RestaurantDetails from './pages/RestaurantDetails';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Offers from './pages/Offers';
import RestaurantsList from './pages/RestaurantsList';
import RestaurantForm from './pages/RestaurantForm';
import TablesList from './pages/TablesList';
import TableForm from './pages/TableForm';
import MenuList from './pages/MenuList';
import MenuForm from './pages/MenuForm';
// Sidebar removed per request
import Header from './components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { getToken } from './utils/auth';

function App() {
  const [token, setToken] = useState(getToken());

  // verify token server-side on mount (prevents stale tokens from bypassing login)
  React.useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('invalid');
      } catch (err) {
        // invalid token — clear and show login
        try { localStorage.removeItem('owner_token'); } catch(e){}
        setToken(null);
      }
    })();
  }, []);

  // clear token when other parts of the app dispatch app:logout (e.g. on 401)
  React.useEffect(() => {
    function onGlobalLogout() { setToken(null); }
    window.addEventListener('app:logout', onGlobalLogout);
    return () => window.removeEventListener('app:logout', onGlobalLogout);
  }, []);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuth={() => setToken(getToken())} />} />
        <Route path="/signup" element={<Signup onAuth={() => setToken(getToken())} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  function handleLogout() {
    setToken(null);
  }


  return (
    <div className="owner-app-layout">
      <main className="owner-main-content full-width">
        <AppHeader onLogout={handleLogout} />
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/restaurants" element={<RestaurantsList />} />
            <Route path="/restaurant/:id" element={<RestaurantForm />} />
            <Route path="/restaurant/new" element={<RestaurantForm />} />
            <Route path="/tables" element={<TablesList />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/tables/new" element={<TableForm />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="/menu/new" element={<MenuForm />} />
            <Route path="/restaurant" element={<RestaurantDetails />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function AppHeader({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  function titleForPath(path) {
    if (path === '/' || path === '') return 'Dashboard';
    if (path.startsWith('/restaurants')) return 'Restaurants';
    if (path.startsWith('/menu')) return 'Menu Items';
    if (path.startsWith('/tables')) return 'Tables';
    if (path.startsWith('/bookings')) return 'Bookings';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Owner Panel';
  }

  const title = titleForPath(location.pathname);

  if (typeof Header !== 'function' && typeof Header !== 'object') {
    console.error('Invalid Header import in AppHeader:', Header);
    return <div style={{padding:20,background:'#fee',color:'#900'}}>Header component not found (check imports). See console for details.</div>;
  }

  return <Header title={title} onProfile={() => navigate('/profile')} onLogout={onLogout} />;
}

export default App;
