import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, User, LogOut, Menu } from 'lucide-react';
import { removeToken, authFetch } from '../utils/auth';
import '../styles/Header.css';

function Header({ title, onProfile, onLogout, toggleSidebar }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState(null);
  const ddRef = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    authFetch('/api/auth/me').then(profile => {
      if (mounted) setOwner(profile);
    }).catch(err => {
      console.debug('Failed to load owner profile', err.message || err);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <header className="premium-header">
      <div className="header-left">
        <button className="sidebar-toggle-trigger" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-center desktop-only">
        <div className="header-search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search anything..." />
          <div className="search-shortcut">⌘K</div>
        </div>
      </div>

      <div className="header-right" ref={ddRef}>
        <div className="header-actions">
          <button className="notification-btn" title="Notifications">
            <Bell size={20} />
            <span className="bell-dot" />
          </button>

          <button 
            className="create-btn desktop-only" 
            onClick={() => navigate('/restaurant/new')}
          >
            <Plus size={18} />
            <span>Add Restaurant</span>
          </button>
        </div>

        <div className="user-dropdown-wrapper">
          <button className="user-trigger" onClick={() => setOpen(v => !v)}>
            <div className="user-avatar-circle">
              {owner?.name?.charAt(0) || 'O'}
            </div>
          </button>
          
          {open && (
            <div className="premium-dropdown">
              <div className="dropdown-user-header">
                <span className="user-full-name">{owner?.name || 'Owner'}</span>
                <span className="user-email-text">{owner?.email || ''}</span>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-action" onClick={() => { setOpen(false); if (onProfile) onProfile(); else navigate('/profile'); }}>
                <User size={16} />
                Profile Settings
              </button>
              <button className="dropdown-action text-error" onClick={() => { setOpen(false); removeToken(); if (onLogout) onLogout(); navigate('/login'); }}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;


