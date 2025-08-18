import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      // Demo: simulate API call delay
      await new Promise((r) => setTimeout(r, 600));
      // Simulate success; in real app, call backend and handle tokens
      onLogin && onLogin({ email: form.email, name: form.email.split('@')[0] });
      window.location.hash = '#home';
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2 className="login-title">Login</h2>
        <div className="form-row">
          <label>Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'invalid' : ''}
              autoComplete="email"
              required
            />
          </label>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-row">
          <label>Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'invalid' : ''}
              autoComplete="current-password"
              required
            />
          </label>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>
        <button className="login-btn" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>
        <div className="login-footer">
          <span>Don't have an account?</span>
          <a href="#signup" className="link"> Sign up</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
