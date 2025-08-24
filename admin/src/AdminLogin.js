import React, { useState } from 'react';
import './AdminLogin.css';
import { apiPost } from './api';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function AdminLogin({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setError(null);
    setLoading(true);
    apiPost('/login', { email, password }).then(data => {
      setLoading(false);
      onLogin && onLogin({ token: data.token, user: data.user });
    }).catch(err => {
      setLoading(false);
      setError(err.message || 'Login failed');
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // phone optional but when provided it should be valid
    if (phone && !isValidPhoneNumber(phone)) {
      setError('Invalid phone number');
      return;
    }

  setLoading(true);
  apiPost('/register', { name, email, password, phone: phone || '' })
      .then(() => {
        // Auto-login after successful registration
        return apiPost('/login', { email, password });
      })
      .then(data => {
        setLoading(false);
        onLogin && onLogin({ token: data.token, user: data.user });
      })
      .catch(err => { setLoading(false); setError(err.message || 'Registration failed'); });
  };

  return (
    <div className="admin-login-wrapper">
      <form className="admin-login" onSubmit={isSignup ? handleSignup : handleLogin}>
        <h2>{isSignup ? 'Create Admin Account' : 'Admin Login'}</h2>
        {error && <div className="admin-login-error">{error}</div>}

        <div className="admin-login-header">
          <div className="admin-login-logo">🍽️</div>
          <div className="admin-login-title">{isSignup ? 'Create Admin Account' : 'Admin Login'}</div>
        </div>

        {isSignup && (
          <label className="admin-input-label">
            Full name
            <input className="admin-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </label>
        )}

        <label className="admin-input-label">
          Email
          <input className="admin-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        {isSignup && (
          <div className="admin-input-group">
            <label className="admin-input-label admin-phone-label">Phone (optional)
              <div className="admin-phone-row">
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={phone}
                  onChange={setPhone}
                  className="admin-phone-input"
                />
              </div>
            </label>
          </div>
        )}

        <label className="admin-input-label">
          Password
          <div className="password-wrapper">
            <input className="admin-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
            <button type="button" className={`toggle-password ${showPassword ? 'open' : ''}`} onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
              {/* Eye icon (visible when closed) */}
              <svg className="icon-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Eye-off icon (visible when open) */}
              <svg className="icon-eye-off" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.8 18.8 0 0 1 5.11-4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </label>

        {isSignup && (
          <label className="admin-input-label">
            Confirm password
            <div className="password-wrapper">
              <input className="admin-input" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
              <button type="button" className={`toggle-password ${showConfirmPassword ? 'open' : ''}`} onClick={() => setShowConfirmPassword(s => !s)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} aria-pressed={showConfirmPassword}>
                <svg className="icon-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg className="icon-eye-off" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.8 18.8 0 0 1 5.11-4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </label>
        )}

  <button type="submit" disabled={loading}>{isSignup ? (loading ? 'Creating...' : 'Create account') : (loading ? 'Signing in...' : 'Sign in')}</button>

        <div className="admin-login-meta">
          {isSignup ? (
            <button type="button" className="admin-login-switch" onClick={() => { setIsSignup(false); setError(null); }}>
              ← Back to login
            </button>
          ) : (
            <button type="button" className="admin-login-switch" onClick={() => { setIsSignup(true); setError(null); }}>
              Create account
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
