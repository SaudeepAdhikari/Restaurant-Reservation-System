import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/modules/Auth.module.css';
import { apiPost, saveToken } from '../utils/auth';

function Login({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Email and password required');
    try {
      const res = await apiPost('/api/admin/auth/login', form);
      saveToken(res.token);
      if (typeof onAuth === 'function') onAuth();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <div className={styles.formError}>{error}</div>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className={styles.btnPrimary} type="submit">Login</button>
        <div className={styles.authFooter}>Don't have an account? <Link to="/signup">Sign up</Link></div>
      </form>
    </div>
  );
}

export default Login;
