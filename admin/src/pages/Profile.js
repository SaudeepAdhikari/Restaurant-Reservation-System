import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your admin account</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label className="info-label">Full Name</label>
            <div className="info-value">{profile.name || 'Admin User'}</div>
          </div>

          <div className="info-group">
            <label className="info-label">Email Address</label>
            <div className="info-value">{profile.email || 'admin@restaurant.com'}</div>
          </div>

          <div className="info-group">
            <label className="info-label">Role</label>
            <div className="info-value">
              <span className="role-badge">Administrator</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-base btn-primary">Edit Profile</button>
          <button className="btn-base btn-secondary">Change Password</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
