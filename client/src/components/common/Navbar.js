import React from 'react';
import styles from '../../styles/modules/Navbar.module.css';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>BookEat</div>
      <ul className={styles.navLinks}>
        <li>Home</li>
        <li>Restaurants</li>
        <li>Offers</li>
        <li>Bookings</li>
        <li>Profile</li>
      </ul>
      <button className={styles.loginBtn}>Login</button>
    </nav>
  );
}

export default Navbar;
