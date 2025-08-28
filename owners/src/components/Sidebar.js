import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { removeToken } from '../utils/auth';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/restaurant', label: 'Restaurant', icon: '🍽️' },
  { path: '/tables', label: 'Tables', icon: '🪑' },
  { path: '/menu', label: 'Menu', icon: '📋' },
  { path: '/bookings', label: 'Bookings', icon: '📅' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    if (onLogout) onLogout();
    navigate('/login');
  }
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Owner Panel</div>
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
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;
