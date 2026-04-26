import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, LogOut, Menu, X, Home, Utensils, Tag, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import HeaderDropdown from './HeaderDropdown';
import ConfirmModal from './ConfirmModal';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { icon: <User size={16} />, label: 'Profile', action: () => { setShowUserMenu(false); navigate('/profile'); } },
    { icon: <LogOut size={16} />, label: 'Logout', action: () => { setShowUserMenu(false); setConfirmOpen(true); } },
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/customers/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(u => {
        if (!mounted || !u) return;
        setUser(u);
        const name = u.name || '';
        const parts = name.trim().split(/\s+/);
        const first = parts[0] ? parts[0].charAt(0).toUpperCase() : '';
        const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
        setInitials((first + last) || 'U');
      }).catch(() => { }).finally(() => { mounted = false; });
    return () => { mounted = false; };
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: '/dashboard', icon: <Home size={18} /> },
    { label: 'Restaurants', path: '/restaurants', icon: <Utensils size={18} /> },
    { label: 'Offers', path: '/offers', icon: <Tag size={18} /> },
    { label: 'Bookings', path: '/booking/history', icon: <Calendar size={18} /> },
  ];

  return (
    <nav className={`navbar-root ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container container">
        <div className="navbar-left" onClick={() => navigate('/dashboard')}>
          <div className="logo-icon">
            <Utensils size={24} color="white" />
          </div>
          <span className="logo-text">Gourmet<span>Ease</span></span>
        </div>

        <div className="navbar-center desktop-only">
          <ul className="nav-links-list">
            {navLinks.map((link) => (
              <li 
                key={link.path} 
                className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div layoutId="nav-underline" className="nav-underline" />
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-right">
          <div className="desktop-only search-trigger">
            <Search size={20} className="text-muted" />
          </div>
          
          <div className="navbar-actions">
            {initials === 'U' ? (
              <Button variant="primary" size="small" onClick={() => navigate('/login')}>Sign In</Button>
            ) : (
              <div ref={userRef} className="user-profile-wrapper">
                <button
                  className="avatar-trigger"
                  onClick={() => setShowUserMenu((s) => !s)}
                >
                  <div className="avatar-circle">{initials}</div>
                  <span className="user-name-small desktop-only">{user?.name?.split(' ')[0]}</span>
                </button>
                <HeaderDropdown items={userMenu} visible={showUserMenu} />
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu-overlay"
          >
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li 
                  key={link.path} 
                  className={`mobile-nav-item ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                >
                  {link.icon}
                  {link.label}
                </li>
              ))}
              <hr className="mobile-divider" />
              {initials === 'U' ? (
                <li className="mobile-nav-item" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  <User size={18} />
                  Login
                </li>
              ) : (
                <>
                  <li className="mobile-nav-item" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                    <User size={18} />
                    Profile
                  </li>
                  <li className="mobile-nav-item text-error" onClick={() => { setConfirmOpen(true); setMobileMenuOpen(false); }}>
                    <LogOut size={18} />
                    Logout
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

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


