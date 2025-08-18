import React, { useState } from 'react';
import './Login.css';

function Signup({ onSignup }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = 'First name required';
    if (!form.lastName) e.lastName = 'Last name required';
    if (!form.phone.match(/^\d{10,15}$/)) e.phone = 'Enter a valid phone number';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.firstName + ' ' + form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone
        })
      });
      if (res.ok) {
        setSuccess('Signup successful! You can now log in.');
        onSignup && onSignup(form);
        setForm({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' });
      } else {
        const err = await res.json();
        setErrors({ api: err.error || 'Signup failed' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <h2 className="signup-title">Sign Up</h2>
        {errors.api && <div className="error-message">{errors.api}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="form-row">
          <label>First Name
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="given-name"
            />
          </label>
          {errors.firstName && <span className="form-error">{errors.firstName}</span>}
        </div>
        <div className="form-row">
          <label>Last Name
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="family-name"
            />
          </label>
          {errors.lastName && <span className="form-error">{errors.lastName}</span>}
        </div>
        <div className="form-row">
          <label>Phone Number
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="tel"
            />
          </label>
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
        <div className="form-row">
          <label>Email
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="email"
            />
          </label>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-row">
          <label>Password
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="new-password"
            />
          </label>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>
        <div className="form-row">
          <label>Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="new-password"
            />
          </label>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>
        <button className="signup-btn" type="submit" disabled={submitting}>{submitting ? 'Signing up...' : 'Sign Up'}</button>
        <div className="signup-footer">
          Already have an account? <a href="#login" className="link">Log in</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;
