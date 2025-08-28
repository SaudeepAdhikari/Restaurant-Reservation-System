import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, saveToken } from '../utils/auth';
import '../styles/Sidebar.css';

function Signup({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiPost('/api/auth/register', { name, email, password });
      if (res.token) {
        saveToken(res.token);
        if (onAuth) onAuth();
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  }

  return (
    <div className="owner-login-page">
      <form className="owner-login-form" onSubmit={handleSubmit}>
        <h2>Owner Signup</h2>
        {error && <div className="form-error">{error}</div>}
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}

export default Signup;
