import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    const sendEmail = email.trim().toLowerCase();

    fetch(`${base}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: sendEmail, password })
    }).then(async res => {
      const txt = await res.text();
      let data = null;
      try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = null; }
      if (!res.ok) {
        const msg = data && data.message ? data.message : (txt || 'Login failed');
        throw new Error(msg);
      }
      return data;
    }).then(() => {
      navigate('/dashboard');
    }).catch(err => {
      console.error(err);
      setError(err.message || 'Login failed');
    }).finally(() => setLoading(false));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="visual-content">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your delicious journey with Your Restro.</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Login</h2>
            <p>Enter your details to access your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <Button type="submit" variant="primary" size="large" disabled={loading} className="w-full">
              {loading ? <Spinner size={20} color="white" /> : 'Sign In'}
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

