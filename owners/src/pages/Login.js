import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, saveToken } from '../utils/auth';
import '../styles/Sidebar.css';
import { Link } from 'react-router-dom';

function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      // First, check auth status before login
      await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/auth/debug-auth', {
        credentials: 'include'
      }).then(r => r.json()).then(data => {
        console.log('Auth status before login:', data);
      }).catch(err => {
        console.error('Debug auth error:', err);
      });
      
      // Perform login
      const res = await apiPost('/api/auth/login', { email, password });
      console.log('Login response:', res);
      
      // Check auth status after login
      await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/auth/debug-auth', {
        credentials: 'include'
      }).then(r => r.json()).then(data => {
        console.log('Auth status after login:', data);
      }).catch(err => {
        console.error('Debug auth error:', err);
      });
      
      // With HttpOnly cookies, we don't need to manually save tokens
      // The token is automatically stored as a cookie by the server
      if (res.owner) {
        // Signal that authentication occurred
        if (onAuth) onAuth('authenticated');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="owner-login-page">
      <form className="owner-login-form" onSubmit={handleSubmit}>
        <h2>Owner Login</h2>
        {error && <div className="form-error">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Login</button>
        <div style={{marginTop: '0.6em', textAlign: 'center'}}>
          <small>Don't have an account? <Link to="/signup">Sign up</Link></small>
        </div>
      </form>
    </div>
  );
}

export default Login;
