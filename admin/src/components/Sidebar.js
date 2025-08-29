import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/owners', label: 'Owners' },
  { path: '/restaurants', label: 'Restaurants' },
  { path: '/customers', label: 'Customers' },
  { path: '/bookings', label: 'Bookings' },
  { path: '/analytics', label: 'Analytics' },
  
];

function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Admin</div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end={item.path === '/'}>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
