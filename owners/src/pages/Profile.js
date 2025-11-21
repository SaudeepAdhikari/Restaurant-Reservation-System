import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import '../styles/Profile.css';
import '../styles/Restaurants.css'; // Reuse form styles

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', createdAt: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const url = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/auth/me';
    authFetch('/api/auth/me')
      .then(p => { if (mounted) { setProfile(p); setForm({ name: p.name, email: p.email }); } })
      .catch(err => { if (mounted) setError(`${err.message} (requested ${url})`); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
  if (error) return <div className="profile-page"><div className="error-banner">{error}</div></div>;

  async function openEdit() {
    setForm({ name: profile.name, email: profile.email });
    setPassword('');
    setFormError(null);
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.email) return setFormError('Name and email required');
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (password) payload.password = password;
      const updated = await authFetch('/api/auth/me', { method: 'PUT', body: JSON.stringify(payload) });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setFormError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Account Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your personal information</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p>Restaurant Owner</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{profile.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{profile.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-base btn-primary" onClick={openEdit}>Edit Profile</button>
          <button className="btn-base btn-secondary">Change Password</button>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Profile</h3>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password (optional)</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-base btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-base btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

