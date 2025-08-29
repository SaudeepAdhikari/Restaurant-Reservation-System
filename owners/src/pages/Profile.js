import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import '../styles/Profile.css';

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

  if (loading) return <div className="settings-page"><h2>Profile</h2><p>Loading...</p></div>;
  if (error) return <div className="settings-page"><h2>Profile</h2><p className="error">{error}</p></div>;

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
    <div className="settings-page">
      <h2>Profile</h2>

      <div className="profile-details">
        <div className="profile-row"><strong>Name:</strong> <span>{profile.name}</span></div>
        <div className="profile-row"><strong>Email:</strong> <span>{profile.email}</span></div>
        <div className="profile-row"><strong>Member since:</strong> <span>{new Date(profile.createdAt).toLocaleString()}</span></div>
        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={openEdit}>Edit</button>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit profile</h3>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSave}>
              <label>
                Name
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </label>
              <label>
                New password (leave blank to keep current)
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="small-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
