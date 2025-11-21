import React, { useEffect, useRef, useState } from 'react';
import './Navbar.css';
import HeaderDropdown from './HeaderDropdown';
import ConfirmModal from './ConfirmModal';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const userMenu = [
    { label: 'Profile', action: () => { setShowUserMenu(false); navigate('/profile'); } },
    { label: 'Logout', action: () => { setShowUserMenu(false); setConfirmOpen(true); } },
  ];

  const doLogout = () => {
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/customers/logout`, { method: 'POST', credentials: 'include' })
      .finally(() => {
        setConfirmOpen(false);
        navigate('/login');
      });
  };

  const [initials, setInitials] = useState('U');
  useEffect(() => {
    let mounted = true;
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/customers/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(u => {
        if (!mounted || !u) return;
        const name = u.name || '';
        const parts = name.trim().split(/\s+/);
        const first = parts[0] ? parts[0].charAt(0).toUpperCase() : '';
        const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
        setInitials((first + last) || 'U');
      }).catch(() => { }).finally(() => { mounted = false; });
    return () => { mounted = false; };
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
        Your Restro
      </div>

      <div className={`navbar-menu-toggle ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <li className={`nav-link ${isActive('/dashboard')}`} onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>Home</li>
        <li className={`nav-link ${isActive('/restaurants')}`} onClick={() => { navigate('/restaurants'); setMobileMenuOpen(false); }}>Restaurants</li>
        <li className={`nav-link ${isActive('/offers')}`} onClick={() => { navigate('/offers'); setMobileMenuOpen(false); }}>Offers</li>
        <li className={`nav-link ${isActive('/booking/history')}`} onClick={() => { navigate('/booking/history'); setMobileMenuOpen(false); }}>Bookings</li>

        {/* Mobile only actions */}
        <li className="nav-link mobile-only">
          {initials === 'U' ? (
            <span onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Login</span>
          ) : (
            <span onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>Profile ({initials})</span>
          )}
        </li>
      </ul>

      <div className="navbar-actions desktop-only">
        {initials === 'U' ? (
          <Button variant="primary" size="small" onClick={() => navigate('/login')}>Login</Button>
        ) : (
          <div ref={userRef} className="avatar-wrapper">
            <button
              className="avatar-btn"
              onClick={() => setShowUserMenu((s) => !s)}
              aria-label="User menu"
            >
              {initials}
            </button>
            <HeaderDropdown items={userMenu} visible={showUserMenu} />
          </div>
        )}
      </div>

      <ConfirmModal
        show={confirmOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={doLogout}
        onCancel={() => setConfirmOpen(false)}
      />
    </nav>
  );
}

export default Navbar;

