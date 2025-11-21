import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    const sendEmail = email.trim().toLowerCase();
    fetch(`${base}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ firstName, lastName, phone, email: sendEmail, password })
    }).then(async res => {
      const txt = await res.text();
      let data = null;
      try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = null; }
      if (!res.ok) {
        const msg = data && data.message ? data.message : (txt || 'Signup failed');
        throw new Error(msg);
      }
      return data;
    }).then(() => {
      navigate('/dashboard');
    }).catch(err => {
      console.error(err);
      setError(err.message || 'Signup failed');
    }).finally(() => setLoading(false));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="visual-content">
            <h2>Join Us Today</h2>
            <p>Create an account to start booking tables at the best restaurants in town.</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Sign Up</h2>
            <p>Create your new account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="flex-between" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>First Name</label>
                <input className="form-input" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Last Name</label>
                <input className="form-input" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input className="form-input" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input className="form-input" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <Button type="submit" variant="primary" size="large" disabled={loading} className="w-full">
              {loading ? <Spinner size={20} color="white" /> : 'Create Account'}
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

