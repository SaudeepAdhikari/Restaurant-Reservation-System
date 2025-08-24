import React, { useState, useEffect, useRef } from 'react';
import './AdminLayout.css';
import AdminLogin from './AdminLogin';
import { apiGet } from './api';

function AdminLayout({ adminName = 'Owner', adminEmail = '', children, onLogout, onLogin, authUser, isAuthed }) {
  const initials = (adminName || 'O').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    if (open && isAuthed && authUser && authUser.id) {
      // fetch fresh profile from server
      apiGet(`/user/${authUser.id}`).then(data => setProfile(data)).catch(() => setProfile(null));
    }
  }, [open, isAuthed, authUser]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">🍽️ RestroBook</div>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => window.location.hash = '#my-restaurant'}>My Restaurant</button>
          <button className="admin-nav-link" onClick={() => window.location.hash = '#menu'}>Menu</button>
          <button className="admin-nav-link" onClick={() => window.location.hash = '#tables'}>Tables</button>
          <button className="admin-nav-link" onClick={() => window.location.hash = '#reservations'}>Reservations</button>
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-welcome">Welcome, {adminName}</div>
            {adminEmail && <div className="admin-email">{adminEmail}</div>}
          </div>
          <div className="admin-topbar-right" ref={ref}>
            <button className="admin-avatar" onClick={() => setOpen(o => !o)} title={adminName} aria-label="Account">
              <span className="admin-avatar-initials">{initials}</span>
            </button>

            {open && (
              <div className="admin-avatar-dropdown">
                {!isAuthed ? (
                  <div className="dropdown-login">
                    <AdminLogin onLogin={onLogin} />
                  </div>
                ) : (
                  <div className="dropdown-profile">
                    <div className="profile-row">
                      <div className="profile-avatar">{initials}</div>
                      <div className="profile-info">
                        <div className="profile-name">{profile ? profile.firstName + ' ' + profile.lastName : adminName}</div>
                        <div className="profile-email">{profile ? profile.email : adminEmail}</div>
                      </div>
                    </div>
                    <div className="profile-actions" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                      <button className="profile-btn" onClick={() => { window.location.hash = '#profile'; setOpen(false); }}>View profile</button>
                      <div style={{height: '0.5rem'}} />
                      <button className="profile-btn" onClick={() => { if (onLogout) onLogout(); setOpen(false); }}>Logout</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
