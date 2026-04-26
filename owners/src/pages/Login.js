import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { apiPost } from '../utils/auth';
import './Auth.css';

function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/login', { email, password });
      if (res.owner) {
        if (onAuth) onAuth('authenticated');
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-root">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card-premium"
      >
        <div className="auth-brand">
          <div className="brand-logo-icon">
            <Utensils size={28} color="white" />
          </div>
          <h1>Partner Dashboard</h1>
          <p>Manage your culinary business with GourmetEase</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-modern">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="form-alert error"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <div className="input-group-modern">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="chef@yourkitchen.com"
                required
              />
            </div>
          </div>

          <div className="input-group-modern">
            <div className="label-row">
              <label>Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Forgot?</Link>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-small" />
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-modern">
          New to GourmetEase? <Link to="/signup">Start your free trial</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;


