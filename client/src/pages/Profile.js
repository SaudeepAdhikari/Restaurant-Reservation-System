import React, { useEffect, useState } from 'react';
import '../pages/Profile.css';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/customers/me`, {
      credentials: 'include'
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(res.status + ' ' + text);
        }
        return res.json();
      })
      .then(data => {
        if (mounted) {
          setProfile(data);
          setForm({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            email: data.email || '',
            password: ''
          });
        }
      })
      .catch(err => { console.error(err); if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    try {
      const res = await fetch(`${base}/api/customers/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(res.status + ' ' + text);
      }
      const data = await res.json();
      setProfile(data);
      setEditing(false);
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    }
  }

  if (loading) return <div className="flex-center" style={{ minHeight: '80vh' }}><Spinner size={40} /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings and preferences.</p>
      </div>

      <div className="page-container">
        {error && <div className="error-state" style={{ marginBottom: '2rem' }}>Error: {error}</div>}

        {profile && (
          <div className="profile-container">
            <div className="profile-sidebar">
              <div className="profile-avatar">
                {profile.firstName ? profile.firstName[0] : 'U'}
              </div>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{profile.bookings?.length || 0}</span>
                  <span className="stat-label">Bookings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Reviews</span>
                </div>
              </div>
            </div>

            <div className="profile-content">
              <div className="section-header flex-between">
                <h2>Account Details</h2>
                {!editing && (
                  <Button variant="outline" size="small" onClick={() => setEditing(true)}>Edit Profile</Button>
                )}
              </div>

              {!editing ? (
                <div className="profile-details-view">
                  <div className="form-grid">
                    <div className="field">
                      <label className="text-secondary text-sm">First Name</label>
                      <div className="font-medium">{profile.firstName}</div>
                    </div>
                    <div className="field">
                      <label className="text-secondary text-sm">Last Name</label>
                      <div className="font-medium">{profile.lastName}</div>
                    </div>
                    <div className="field">
                      <label className="text-secondary text-sm">Email</label>
                      <div className="font-medium">{profile.email}</div>
                    </div>
                    <div className="field">
                      <label className="text-secondary text-sm">Phone</label>
                      <div className="font-medium">{profile.phone || '—'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-input" name="firstName" value={form.firstName} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" name="lastName" value={form.lastName} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" name="phone" value={form.phone} onChange={onChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" name="email" value={form.email} onChange={onChange} type="email" required />
                    </div>
                    <div className="form-group full-width">
                      <label className="form-label">New Password <span className="text-light text-sm">(leave blank to keep current)</span></label>
                      <input className="form-input" name="password" value={form.password} onChange={onChange} type="password" />
                    </div>
                  </div>

                  <div className="flex-end gap-4 mt-6">
                    <Button type="button" variant="secondary" onClick={() => { setEditing(false); setForm({ firstName: profile.firstName || '', lastName: profile.lastName || '', phone: profile.phone || '', email: profile.email || '', password: '' }); }}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {!loading && !profile && !error && (
          <div className="empty-state">
            <p>No profile data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

