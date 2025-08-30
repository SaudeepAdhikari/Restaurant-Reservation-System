import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/modules/Navbar.module.css';
import HeaderDropdown from './HeaderDropdown';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showCuisines, setShowCuisines] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef(null);
  const cuisinesRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (cuisinesRef.current && !cuisinesRef.current.contains(e.target)) {
        setShowCuisines(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const cuisines = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Thai'];
  // convert to action items that navigate within the SPA
  const cuisineItems = cuisines.map((c) => ({
    label: c,
    action: () => {
      setShowCuisines(false);
      navigate(`/?cuisine=${encodeURIComponent(c)}`);
    },
  }));

  const userMenu = [
    { label: 'Profile', action: () => { setShowUserMenu(false); navigate('/profile'); } },
    { label: 'Logout', action: () => { setShowUserMenu(false); console.log('logout clicked'); } },
  ];

  // derive user initials from localStorage (fallback to 'U')
  const [initials, setInitials] = useState('U');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const name = u.name || u.fullName || u.username || '';
        if (name) {
          const parts = name.trim().split(/\s+/);
          const first = parts[0] ? parts[0].charAt(0).toUpperCase() : '';
          const last = parts.length > 1 ? parts[parts.length-1].charAt(0).toUpperCase() : '';
          setInitials((first + last) || 'U');
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setInitials('U');
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.logo}>Your Restro</div>

      <ul className={styles.navLinks}>
        <li role="button" tabIndex={0} onClick={() => navigate('/')}>Home</li>

  <li role="button" tabIndex={0} onClick={() => navigate('/restaurants')}>Restaurants</li>

        <li role="button" tabIndex={0} onClick={() => navigate('/offers')}>Offers</li>
        <li role="button" tabIndex={0} onClick={() => navigate('/booking/history')}>Bookings</li>

        <li ref={userRef} className={styles.avatarWrapper}>
          <button
            className={styles.avatarBtn}
            onClick={() => setShowUserMenu((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showUserMenu}
            aria-label="User menu"
          >
            <div className={styles.avatarInitials} aria-hidden="true">{initials}</div>
          </button>
          <HeaderDropdown items={userMenu} visible={showUserMenu} />
        </li>
      </ul>

      <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
    </nav>
  );
}

export default Navbar;
