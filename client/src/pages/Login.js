import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

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
      console.debug('[login] sending login for', sendEmail);
      fetch(`${base}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: sendEmail, password })
      }).then(async res => {
        // read body once to avoid 'body stream already read' errors
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
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
          {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        <div className="auth-link">Don't have an account? <Link to="/signup">Sign up</Link></div>
      </form>
    </div>
  );
}

export default Login;
