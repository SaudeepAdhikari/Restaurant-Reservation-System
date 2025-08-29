import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken, authFetch } from '../utils/auth';
import '../styles/Header.css';

function Header({ title, onProfile, onLogout }) {
  const navigate = useNavigate();

  const nav = [
    { label: 'Dashboard', to: '/' },
    { label: 'Restaurants', to: '/restaurants' },
    { label: 'Menu', to: '/menu' },
    { label: 'Tables', to: '/tables' },
    { label: 'Bookings', to: '/bookings' },
  ];

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
      // silent: not logged in or token expired
      console.debug('Failed to load owner profile', err.message || err);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <header className="owner-topbar">
      <div className="owner-topbar-left" onClick={() => { console.log('logo clicked'); navigate('/'); }} style={{cursor:'pointer'}}>
        <div className="owner-logo">Your Restro</div>
      </div>
      <nav className="owner-topbar-nav">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({isActive}) => 'owner-nav-link' + (isActive? ' active':'')}
            onClick={() => console.log('nav click', item.label)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="owner-topbar-actions" ref={ddRef}>
        <button className="cta-btn" onClick={() => { navigate('/restaurant/new'); }}>Add Restaurant</button>
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
