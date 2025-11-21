import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggle }) => {
  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/restaurants', icon: '🏪', label: 'Restaurants' },
    { path: '/menu', icon: '🍽️', label: 'Menu' },
    { path: '/tables', icon: '🪑', label: 'Tables' },
    { path: '/bookings', icon: '📅', label: 'Bookings' },
    { path: '/offers', icon: '🏷️', label: 'Offers' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2 className="brand-logo">
          Owner<span className="text-primary">Panel</span>
          <span className="pro-badge">PRO</span>
        </h2>
        <button className="toggle-btn" onClick={toggle}>
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && <p className="copyright">© 2024 Restaurant OS</p>}
      </div>
    </aside>
  );
};

export default Sidebar;
