import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import '../styles/Topbar.css';

function Topbar() {
  const [open, setOpen] = useState(false);
  const ddRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onDoc(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function handleLogout() {
    localStorage.removeItem('admin_token');
    try { window.dispatchEvent(new Event('app:logout')); } catch (e) { }
    navigate('/login');
  }

  const getPageTitle = (path) => {
    const titles = {
      '/': 'Platform Overview',
      '/owners': 'Partnership Management',
      '/restaurants': 'Global Venue List',
      '/customers': 'Customer Directory',
      '/bookings': 'Reservation Master List',
      '/analytics': 'Performance Intelligence',
      '/profile': 'Administrator Profile'
    };
    return titles[path] || 'Administration';
  };

  return (
    <header className="admin-premium-topbar">
      <div className="topbar-left-content">
        <button className="mobile-nav-trigger">
          <Menu size={20} />
        </button>
        <div className="breadcrumb-area">
          <span className="breadcrumb-root">Admin</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{getPageTitle(location.pathname)}</span>
        </div>
      </div>

      <div className="topbar-center-content">
        <div className="global-search-bar">
          <Search size={18} className="search-icon-dim" />
          <input type="text" placeholder="Search platform data..." />
          <div className="search-tag">⌘F</div>
        </div>
      </div>

      <div className="topbar-right-content" ref={ddRef}>
        <div className="quick-actions-bar">
          <button className="topbar-action-btn" title="System Notifications">
            <Bell size={20} />
            <span className="alert-badge" />
          </button>
          <button className="topbar-action-btn" title="Global Settings">
            <Settings size={20} />
          </button>
        </div>

        <div className="admin-user-menu">
          <button className="user-menu-trigger" onClick={() => setOpen(v => !v)}>
            <div className="admin-avatar-box">AD</div>
          </button>
          
          {open && (
            <div className="admin-profile-dropdown">
              <div className="dropdown-user-info">
                <span className="full-name">Super Admin</span>
                <span className="role-tag">Full Access</span>
              </div>
              <div className="dropdown-divider-dim" />
              <button className="dropdown-link-btn" onClick={() => { setOpen(false); navigate('/profile'); }}>
                <User size={16} />
                Profile Details
              </button>
              <button className="dropdown-link-btn danger" onClick={handleLogout}>
                <LogOut size={16} />
                Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;

