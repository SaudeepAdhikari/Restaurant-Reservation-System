import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import '../styles/Profile.css';

function EditModal({ initial, onClose, onSaved }) {
  const [name, setName] = useState(initial.name || '');
  const [email, setEmail] = useState(initial.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await authFetch('/api/admin/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ name, email, password: password || undefined })
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      setErr(e.message || String(e));
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Profile</h3>
        {err && <div className="error">{err}</div>}
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} />
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <label>New password (leave blank to keep)</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="modal-actions">
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    let mounted = true;
    authFetch('/api/admin/auth/me')
      .then(p => { if (mounted) setProfile(p); })
      .catch(err => { if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="settings-page"><h2>Profile</h2><p>Loading...</p></div>;
  if (error) return <div className="settings-page"><h2>Profile</h2><p className="error">{error}</p></div>;

  return (
    <div className="settings-page">
      <h2>Profile</h2>
      <div className="profile-card">
        <div className="profile-row"><strong>Name:</strong> <span>{profile.name}</span></div>
        <div className="profile-row"><strong>Email:</strong> <span>{profile.email}</span></div>
        <div className="profile-row"><strong>Member since:</strong> <span>{new Date(profile.createdAt).toLocaleString()}</span></div>
        <div style={{marginTop:12}}>
          <button onClick={() => setShowEdit(true)}>Edit</button>
        </div>
      </div>
      {showEdit && <EditModal initial={profile} onClose={() => setShowEdit(false)} onSaved={(u) => setProfile(u)} />}
    </div>
  );
}

export default Profile;
