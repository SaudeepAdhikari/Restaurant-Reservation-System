import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Store, 
  UtensilsCrossed, 
  Grid3X3, 
  CalendarCheck, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggle }) => {
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/restaurants', icon: <Store size={20} />, label: 'Restaurants' },
    { path: '/menu', icon: <UtensilsCrossed size={20} />, label: 'Menu' },
    { path: '/tables', icon: <Grid3X3 size={20} />, label: 'Tables' },
    { path: '/bookings', icon: <CalendarCheck size={20} />, label: 'Bookings' },
    { path: '/offers', icon: <Tag size={20} />, label: 'Offers' },
  ];

  const secondaryItems = [
    { path: '/profile', icon: <Settings size={20} />, label: 'Settings' },
    { path: '/help', icon: <HelpCircle size={20} />, label: 'Help Center' },
  ];

  return (
    <aside className={`sidebar-premium ${isOpen ? 'is-open' : 'is-collapsed'}`}>
      <div className="sidebar-brand-area">
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="brand-full"
          >
            <div className="brand-dot" />
            <span>GourmetEase</span>
            <span className="badge-saas">SaaS</span>
          </motion.div>
        )}
        <button className="toggle-collapse-btn" onClick={toggle}>
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="sidebar-scrollable">
        <div className="nav-group">
          {isOpen && <div className="group-label">Main Menu</div>}
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="link-icon-wrapper">{item.icon}</div>
              {isOpen && <span className="link-label">{item.label}</span>}
              {!isOpen && <div className="tooltip-sidebar">{item.label}</div>}
            </NavLink>
          ))}
        </div>

        <div className="nav-group secondary">
          {isOpen && <div className="group-label">System</div>}
          {secondaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="link-icon-wrapper">{item.icon}</div>
              {isOpen && <span className="link-label">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="sidebar-user-section">
        <div className="user-avatar-mini">JD</div>
        {isOpen && (
          <div className="user-info-mini">
            <span className="user-name-mini">John Doe</span>
            <span className="user-role-mini">Administrator</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

