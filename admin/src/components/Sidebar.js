import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/owners', icon: '👥', label: 'Owners' },
  { path: '/restaurants', icon: '🏪', label: 'Restaurants' },
  { path: '/customers', icon: '👤', label: 'Customers' },
  { path: '/bookings', icon: '📅', label: 'Bookings' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
];

function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="brand-logo">
          Admin<span className="text-primary">Panel</span>
          <span className="pro-badge">PRO</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="copyright">© 2024 Restaurant Admin</p>
      </div>
    </aside>
  );
}

export default Sidebar;
