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
import UploadMenu from './pages/UploadMenu';
// Sidebar removed per request
import Header from './components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { getToken, removeToken } from './utils/auth';

function App() {
  // Don't initialize with getToken() as cookies can't be accessed via JS
  const [token, setToken] = useState(null);
  // Add loading state to prevent flashing login screen during auth check
  const [loading, setLoading] = useState(true);

  // Verify token server-side on mount with improved error handling and retry
  React.useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    const checkAuthStatus = async () => {
      try {
        console.log('Checking authentication status on app load...');
        if (isMounted) setLoading(true);
        
        // Debug auth status first
        try {
          const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
          const debugRes = await fetch(`${API_BASE}/api/auth/debug-auth`, {
            credentials: 'include',
            cache: 'no-store', // Prevent caching
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!debugRes.ok) {
            console.warn('Debug endpoint returned non-ok status:', debugRes.status);
          }
          
          const debugData = await debugRes.json();
          console.log('Auth debug info:', debugData);
          
          // Check if the debug data already confirms a valid token
          if (debugData.tokenValid) {
            console.log('Valid token detected in debug data');
            if (isMounted) {
              setToken('authenticated');
              setLoading(false);
            }
            return; // Skip additional checks if we already know it's valid
          }
        } catch (debugErr) {
          console.error('Debug auth error:', debugErr);
          // Continue to main auth check even if debug check fails
        }
        
        // Main authentication check
        const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          console.error('Authentication check failed:', res.status, res.statusText);
          throw new Error('invalid');
        }
        
        const userData = await res.json();
        console.log('Successfully authenticated!', userData);
        
        // Successfully authenticated, update token state if component still mounted
        if (isMounted) setToken('authenticated');
      } catch (err) {
        // Invalid token — show login
        console.error('Auth check error:', err);
        
        // Only attempt to clear token if component is still mounted
        if (isMounted) {
          try {
            await removeToken();
          } catch (e) {
            console.error('Failed to clear token on auth error:', e);
          }
          
          setToken(null);
        }
      } finally {
        // Always set loading to false when done if component still mounted
        if (isMounted) setLoading(false);
      }
    };

    // Run the auth check
    checkAuthStatus();
    
    // Cleanup function to handle unmounting
    return () => {
      isMounted = false;
    };
  }, []);

  // clear token when other parts of the app dispatch app:logout (e.g. on 401)
  React.useEffect(() => {
    async function onGlobalLogout() { 
      try {
        // Make sure to clear the cookie via the logout endpoint
        await removeToken();
      } catch (e) {
        console.error('Error during global logout:', e);
      }
      setToken(null); 
    }
    window.addEventListener('app:logout', onGlobalLogout);
    return () => window.removeEventListener('app:logout', onGlobalLogout);
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Show login/signup routes if not authenticated
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuth={(token) => setToken(token)} />} />
        <Route path="/signup" element={<Signup onAuth={(token) => setToken(token)} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  async function handleLogout() {
    try {
      // Call the removeToken function which will hit the logout endpoint
      await removeToken();
      console.log('Logout successful');
      // Then update our local state
      setToken(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout anyway
      setToken(null);
    }
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
            <Route path="/upload-menu" element={<UploadMenu />} />
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
