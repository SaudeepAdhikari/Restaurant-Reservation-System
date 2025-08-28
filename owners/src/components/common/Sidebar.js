import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../../styles/modules/Sidebar.module.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/restaurant', label: 'Restaurant', icon: '🍽️' },
  { path: '/tables', label: 'Tables', icon: '🪑' },
  { path: '/menu', label: 'Menu', icon: '📋' },
  { path: '/bookings', label: 'Bookings', icon: '📅' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Owner Panel</div>
      <nav className={styles.sidebarNav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? styles.active : styles.navLink}
            end={item.path === '/'}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
