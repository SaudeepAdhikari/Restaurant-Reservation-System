import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile({ user }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const uid = user && (user.id || user._id || user._id?._id || null);
    if (!user) return;
    // populate from DB when possible
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        if (uid) {
          const res = await fetch(`http://localhost:5000/api/user/${uid}`);
          if (!res.ok) throw new Error('Failed to load profile');
          const data = await res.json();
          setForm(f => ({
            ...f,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || ''
          }));
        } else if (user && user.email) {
          // try to fetch by email as fallback
          const res = await fetch(`http://localhost:5000/api/user/email/${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            setForm(f => ({
              ...f,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              phone: data.phone || ''
            }));
          } else {
            // fallback to user prop
            const [firstName = '', lastName = ''] = (user.name || '').split(' ');
            setForm(f => ({ ...f, firstName, lastName, email: user.email || '', phone: user.phone || '' }));
          }
        } else {
          const [firstName = '', lastName = ''] = (user.name || '').split(' ');
          setForm(f => ({ ...f, firstName, lastName, email: user.email || '', phone: user.phone || '' }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load');
        // fallback to user prop
        const [firstName = '', lastName = ''] = (user.name || '').split(' ');
        setForm(f => ({ ...f, firstName, lastName, email: user.email || '', phone: user.phone || '' }));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  if (!user) return <div className="profile-wrapper"><h2>Please log in to view your profile.</h2></div>;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = 'First name required';
    if (!form.lastName) e.lastName = 'Last name required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Enter a valid email';
    if (!form.phone.match(/^\d{10,15}$/)) e.phone = 'Enter a valid phone number';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleEdit = () => {
    setEdit(true);
    setSuccess('');
    setErrors({});
  };

  const handleCancel = () => {
    const [firstName = '', lastName = ''] = (user.name || '').split(' ');
    setForm({
      firstName,
      lastName,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      confirmPassword: ''
    });
    setEdit(false);
    setErrors({});
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      // Ensure we have a valid id to PUT to. If user.id is missing, try to resolve by email.
      let targetId = user && (user.id || user._id || null);
      if (!targetId && user && user.email) {
        try {
          const r = await fetch(`http://localhost:5000/api/user/email/${encodeURIComponent(user.email)}`);
          if (r.ok) {
            const d = await r.json();
            targetId = d.id;
          }
        } catch (err) {
          // ignore — we'll handle below if no id
        }
      }
      if (!targetId) {
        setErrors({ api: 'Unable to determine user id for update' });
        return;
      }

      const res = await fetch(`http://localhost:5000/api/user/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setForm(f => ({ ...f, ...updated, password: '', confirmPassword: '' }));
          // Update stored user in localStorage so login persists with new name/email
          try {
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const newName = `${updated.firstName || ''} ${updated.lastName || ''}`.trim();
            // Preserve token and id if present
            const merged = {
              ...stored,
              id: stored.id || targetId,
              name: newName || stored.name,
              email: updated.email || stored.email,
              token: stored.token || user.token || null
            };
            localStorage.setItem('user', JSON.stringify(merged));
          } catch (e) {
            // ignore
          }
        setSuccess('Profile updated successfully!');
        setEdit(false);
      } else {
        const err = await res.json();
        setErrors({ api: err.error || 'Update failed' });
      }
    } catch (err) {
      setErrors({ api: 'Network error' });
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>
        {success && <div className="success-message">{success}</div>}
        {loading && <div className="profile-row">Loading profile...</div>}
        {error && <div className="form-error">{error}</div>}
        {!edit ? (
          <>
            <div className="profile-row"><span className="profile-label">First Name:</span> {form.firstName || '-'}</div>
            <div className="profile-row"><span className="profile-label">Last Name:</span> {form.lastName || '-'}</div>
            <div className="profile-row"><span className="profile-label">Email:</span> {form.email || '-'}</div>
            <div className="profile-row"><span className="profile-label">Phone:</span> {form.phone || '-'}</div>
            <button className="profile-edit-btn" onClick={handleEdit}>Edit</button>
          </>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <div className="profile-row">
              <label className="profile-label">First Name:
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} />
              </label>
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>
            <div className="profile-row">
              <label className="profile-label">Last Name:
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} />
              </label>
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
            <div className="profile-row">
              <label className="profile-label">Email:
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </label>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="profile-row">
              <label className="profile-label">Phone:
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
              </label>
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>
            <div className="profile-row">
              <label className="profile-label">New Password:
                <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
              </label>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="profile-row">
              <label className="profile-label">Confirm Password:
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
              </label>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="profile-save-btn" type="submit">Save</button>
              <button className="profile-cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
