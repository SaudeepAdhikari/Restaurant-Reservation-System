import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/owners', label: 'Owners', icon: '👤' },
  { path: '/restaurants', label: 'Restaurants', icon: '🍽️' },
  { path: '/customers', label: 'Customers', icon: '🧑‍🤝‍🧑' },
  { path: '/bookings', label: 'Bookings', icon: '📅' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Admin</div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            end={item.path === '/'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
