import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/modules/Navbar.module.css';
import HeaderDropdown from './HeaderDropdown';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showCuisines, setShowCuisines] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef(null);
  const cuisinesRef = useRef(null);

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
  const userMenu = [
    { label: 'Profile', action: () => (window.location.href = '/profile') },
    { label: 'Bookings', action: () => (window.location.href = '/bookings') },
    { label: 'Logout', action: () => console.log('logout clicked') },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.logo}>Your Restro</div>

      <ul className={styles.navLinks}>
        <li>Home</li>

        <li
          ref={cuisinesRef}
          className={styles.dropdownTrigger}
          onMouseEnter={() => setShowCuisines(true)}
          onMouseLeave={() => setShowCuisines(false)}
          onClick={() => setShowCuisines((s) => !s)}
        >
          Restaurants
          <HeaderDropdown items={cuisines} visible={showCuisines} small />
        </li>

        <li>Offers</li>
        <li>Bookings</li>

        <li ref={userRef} className={styles.avatarWrapper}>
          <button
            className={styles.avatarBtn}
            onClick={() => setShowUserMenu((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showUserMenu}
          >
            <img
              src="/assets/avatar-placeholder.png"
              alt="user avatar"
              className={styles.avatarImg}
            />
          </button>
          <HeaderDropdown items={userMenu} visible={showUserMenu} />
        </li>
      </ul>

      <button className={styles.loginBtn}>Login</button>
    </nav>
  );
}

export default Navbar;
