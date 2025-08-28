import React from 'react';
import '../styles/Topbar.css';

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-title">Restaurant Booking Admin</div>
      <div className="topbar-actions">
        <span className="admin-avatar">A</span>
      </div>
    </header>
  );
}

export default Topbar;
