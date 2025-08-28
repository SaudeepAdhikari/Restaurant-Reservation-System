import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/modules/Auth.module.css';
import { apiPost, saveToken } from '../utils/auth';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) return setError('All fields required');
    try {
      const res = await apiPost('/api/admin/auth/register', form);
      saveToken(res.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Admin Signup</h2>
        {error && <div className={styles.formError}>{error}</div>}
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className={styles.btnPrimary} type="submit">Sign Up</button>
        <div className={styles.authFooter}>Already have an account? <Link to="/login">Login</Link></div>
      </form>
    </div>
  );
}

export default Signup;
