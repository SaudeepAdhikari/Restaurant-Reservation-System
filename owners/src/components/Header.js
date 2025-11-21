import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <header className="owner-topbar">
      <div className="flex-center" style={{ gap: '1rem' }}>
        <button className="mobile-toggle-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="owner-header-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search..." className="header-search-input" />
      </div>

      <div className="owner-topbar-actions" ref={ddRef}>
        <button className="icon-btn-header" title="Notifications">
          🔔
          <span className="notification-badge">3</span>
        </button>

        <button className="btn-base btn-primary" onClick={() => navigate('/restaurant/new')} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
          + Add Restaurant
        </button>

        <div className="avatar-wrap">
          <button className="avatar-btn" onClick={() => setOpen(v => !v)} aria-haspopup="true" aria-expanded={open}>
            <span className="admin-avatar">{owner && owner.name ? owner.name.charAt(0).toUpperCase() : 'O'}</span>
          </button>
          {open && (
            <div className="avatar-dropdown">
              <div className="dropdown-head">
                <strong className="dropdown-name">{owner ? owner.name : 'Owner'}</strong>
                <div className="dropdown-email">{owner ? owner.email : ''}</div>
              </div>
              <button className="dropdown-item" onClick={() => { setOpen(false); if (onProfile) onProfile(); else navigate('/settings'); }}>Profile</button>
              <button className="dropdown-item" onClick={() => { setOpen(false); removeToken(); if (onLogout) onLogout(); navigate('/login'); }}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

