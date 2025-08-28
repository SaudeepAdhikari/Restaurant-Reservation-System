import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
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
  const navigate = useNavigate();
  function handleLogout() {
  removeToken();
  navigate('/login');
  // reload so App re-reads token and shows login
  window.location.reload();
  }

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

      <div className="sidebar-footer">
        <button className="small-btn" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;
