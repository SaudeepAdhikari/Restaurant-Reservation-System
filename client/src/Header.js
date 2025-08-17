import React, { useState } from 'react';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__logo">🍽️ BistroBook</div>
      <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
        <a href="#home" className="navbar__link">Home</a>
        <a href="#search" className="navbar__link">Search Restaurants</a>
        <a href="#my-reservations" className="navbar__link">My Reservations</a>
        <a href="#login" className="navbar__link navbar__link--cta">Login/Register</a>
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
