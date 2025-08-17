import React from 'react';
import './AdminLayout.css';

function AdminLayout({ adminName = 'Owner', children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">🍽️ My Restaurant</div>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => window.location.hash = '#my-restaurant'}>My Restaurant</button>
          <button className="admin-nav-link" onClick={() => window.location.hash = '#menu'}>Menu</button>
          <button className="admin-nav-link" onClick={() => window.location.hash = '#tables'}>Tables</button>
          <button className="admin-nav-link" onClick={() => window.location.hash = '#reservations'}>Reservations</button>
          <button className="admin-nav-link admin-nav-link--logout" onClick={() => window.location.hash = '#logout'}>Logout</button>
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-welcome">Welcome, {adminName}</span>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
