import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    restaurants: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState('Owner');

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await authFetch('/api/auth/me');
        if (profile) setOwnerName(profile.name);

        // Fetch Stats
        const statsData = await authFetch('/api/owner/dashboard/stats');
        setStats(statsData);

        // Fetch Activity
        const activityData = await authFetch('/api/owner/dashboard/activity');
        setActivity(activityData);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-text">Welcome back, {ownerName}. Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{stats.bookings}</span>
            <span className="stat-trend trend-up">Lifetime</span>
          </div>
          <div className="stat-icon icon-blue">📅</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Est. Revenue</span>
            <span className="stat-value">${stats.revenue}</span>
            <span className="stat-trend trend-up">Based on bookings</span>
          </div>
          <div className="stat-icon icon-green">💰</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Restaurants</span>
            <span className="stat-value">{stats.restaurants}</span>
            <span className="stat-trend">Active locations</span>
          </div>
          <div className="stat-icon icon-purple">🏪</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Page Views</span>
            <span className="stat-value">{stats.views}</span>
            <span className="stat-trend trend-down">Last 30 days</span>
          </div>
          <div className="stat-icon icon-orange">👁️</div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <button className="btn-base btn-sm btn-secondary" onClick={() => navigate('/bookings')}>View All</button>
          </div>
          <div className="activity-list">
            {activity.length === 0 ? (
              <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No recent activity.</p>
            ) : (
              activity.map((item, index) => (
                <div className="activity-item" key={index}>
                  <div className="activity-icon">
                    {item.type === 'booking' ? '👤' : '🍽️'}
                  </div>
                  <div className="activity-details">
                    {item.type === 'booking' ? (
                      <p className="activity-text">
                        <strong>{item.details.customerId?.name || 'Guest'}</strong> made a reservation at <strong>{item.details.restaurantId?.name}</strong>.
                      </p>
                    ) : (
                      <p className="activity-text">
                        New menu item <strong>{item.details.name}</strong> added to <strong>{item.details.restaurantId?.name}</strong>.
                      </p>
                    )}
                    <span className="activity-time">{new Date(item.date).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <div className="action-btn" onClick={() => navigate('/restaurant/new')}>
              <span className="action-btn-icon">➕</span>
              <span className="action-btn-label">Add Restaurant</span>
            </div>
            <div className="action-btn" onClick={() => navigate('/menu/new')}>
              <span className="action-btn-icon">📝</span>
              <span className="action-btn-label">Add Menu Item</span>
            </div>
            <div className="action-btn" onClick={() => navigate('/offers')}>
              <span className="action-btn-icon">🏷️</span>
              <span className="action-btn-label">Create Offer</span>
            </div>
            <div className="action-btn" onClick={() => navigate('/profile')}>
              <span className="action-btn-icon">⚙️</span>
              <span className="action-btn-label">Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

