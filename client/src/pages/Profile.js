import React, { useEffect, useState } from 'react';
import '../styles/Profile.css';

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
      // clear password field after successful update
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    }
  }

  return (
    <main className="profile-root">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Your Profile</h1>
          {profile && !editing && (
            <button className="btn btn-edit" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>

        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error">Error: {error}</p>}

        {profile && !editing && (
          <div className="profile-body">
            <div className="field"><span className="label">Name</span><span className="value">{profile.name}</span></div>
            <div className="field"><span className="label">Email</span><span className="value">{profile.email}</span></div>
            <div className="field"><span className="label">Phone</span><span className="value">{profile.phone || '—'}</span></div>
            <div className="field"><span className="label">Joined</span><span className="value">{new Date(profile.createdAt).toLocaleString()}</span></div>
          </div>
        )}

        {profile && editing && (
          <form className="profile-form" onSubmit={onSubmit}>
            <div className="form-row">
              <label>First name</label>
              <input name="firstName" value={form.firstName} onChange={onChange} required />
            </div>
            <div className="form-row">
              <label>Last name</label>
              <input name="lastName" value={form.lastName} onChange={onChange} required />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={onChange} />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input name="email" value={form.email} onChange={onChange} type="email" required />
            </div>
            <div className="form-row">
              <label>New password</label>
              <input name="password" value={form.password} onChange={onChange} type="password" placeholder="Leave blank to keep current" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-cancel" onClick={() => { setEditing(false); setForm({ firstName: profile.firstName || '', lastName: profile.lastName || '', phone: profile.phone || '', email: profile.email || '', password: '' }); }}>Cancel</button>
              <button type="submit" className="btn btn-save">Save changes</button>
            </div>
          </form>
        )}

        {!loading && !profile && !error && (
          <p>No profile data available.</p>
        )}
      </div>
    </main>
  );
}
