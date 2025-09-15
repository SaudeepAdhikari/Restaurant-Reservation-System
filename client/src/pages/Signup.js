import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

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
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input type="text" name="firstName" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input type="text" name="lastName" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input type="tel" name="phone" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
        <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" name="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing up…' : 'Sign Up'}</button>
        {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
      </form>
    </div>
  );
}

export default Signup;
