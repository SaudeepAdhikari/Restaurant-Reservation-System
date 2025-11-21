import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';

function Topbar() {
  const [open, setOpen] = useState(false);
  const ddRef = useRef();
  const navigate = useNavigate();

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

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      <div className="topbar-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search..." className="search-input" />
      </div>

      <div className="topbar-actions" ref={ddRef}>
        <button className="icon-btn" title="Notifications">
          🔔
          <span className="notification-badge">5</span>
        </button>

        <div className="avatar-wrap">
          <button className="avatar-btn" onClick={() => setOpen(v => !v)} aria-haspopup="true" aria-expanded={open}>
            <span className="admin-avatar">A</span>
          </button>
          {open && (
            <div className="avatar-dropdown">
              <div className="dropdown-head">
                <strong className="dropdown-name">Admin User</strong>
                <div className="dropdown-email">admin@restaurant.com</div>
              </div>
              <button className="dropdown-item" onClick={() => { setOpen(false); navigate('/profile'); }}>Profile</button>
              <button className="dropdown-item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
