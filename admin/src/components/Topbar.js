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
    try { window.dispatchEvent(new Event('app:logout')); } catch(e){}
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-title">Your Restro Admin</div>
      <div className="topbar-actions" ref={ddRef}>
        <button className="profile-btn" onClick={() => setOpen(v => !v)} aria-haspopup="true" aria-expanded={open}>
          <span className="admin-avatar">A</span>
        </button>
        {open && (
          <div className="profile-dropdown">
            <button className="dropdown-item" onClick={() => { setOpen(false); navigate('/profile'); }}>Profile</button>
            <button className="dropdown-item" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
