import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  UserCircle, 
  Calendar, 
  BarChart3, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/owners', icon: <ShieldCheck size={20} />, label: 'Restaurant Owners' },
    { path: '/restaurants', icon: <Store size={20} />, label: 'Active Venues' },
    { path: '/customers', icon: <UserCircle size={20} />, label: 'Customer Base' },
    { path: '/bookings', icon: <Calendar size={20} />, label: 'Reservations' },
    { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Growth Insights' },
  ];

  return (
    <aside className="admin-sidebar-premium">
      <div className="admin-brand">
        <div className="brand-icon-wrapper">
          <ShieldCheck size={24} color="white" />
        </div>
        <div className="brand-text">
          <span className="brand-name">GourmetEase</span>
          <span className="brand-tier">Control Center</span>
        </div>
      </div>

      <nav className="admin-nav-list">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="link-content">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronRight size={14} className="chevron-icon" />
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="version-info">
          <span>v2.4.0 (Stable)</span>
          <div className="status-dot-green" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
