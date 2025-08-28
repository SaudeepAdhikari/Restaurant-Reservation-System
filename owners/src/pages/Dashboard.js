import React from 'react';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1>Welcome, Restaurant Owner</h1>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Bookings</h3>
          <p>View and manage all your bookings in one place.</p>
        </div>
        <div className="dashboard-card">
          <h3>Tables</h3>
          <p>Manage your restaurant's tables and availability.</p>
        </div>
        <div className="dashboard-card">
          <h3>Menu</h3>
          <p>Update your menu items, prices, and images.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
