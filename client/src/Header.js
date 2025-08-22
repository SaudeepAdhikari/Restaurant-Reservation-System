import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Header.css';

function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileRef.current) return;
      // if click outside the profile wrapper, close dropdown
      if (!profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, [profileOpen]);

  return (
    <header className="navbar">
      <a href="#home" className="navbar__logo">🍽️ RestroBook</a>
      <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
        <a href="#home" className="navbar__link">Home</a>
        <a href="#search" className="navbar__link">Search Restaurants</a>
        <a href="#my-reservations" className="navbar__link">My Reservations</a>
        {!user ? (
          <a href="#login" className="navbar__link navbar__link--cta">Login/Register</a>
        ) : (
          <div className="navbar__profile-wrapper" ref={profileRef}>
            <button className="navbar__profile-btn" onClick={(e) => { e.stopPropagation(); setProfileOpen(p => !p); }} aria-label="Profile">
              <FaUserCircle size={28} />
            </button>
            {profileOpen && (
              <div className="navbar__profile-dropdown">
                <div className="navbar__profile-name">{user.name || user.email}</div>
                <a href="#profile" className="navbar__profile-link">Profile</a>
                <button className="navbar__profile-link" onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>
      <button className="navbar__toggle" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle navigation">
        <span className="navbar__hamburger"></span>
        <span className="navbar__hamburger"></span>
        <span className="navbar__hamburger"></span>
      </button>
      {menuOpen && <div className="navbar__backdrop" onClick={() => setMenuOpen(false)}></div>}
    </header>
  );
}

export default Header;

