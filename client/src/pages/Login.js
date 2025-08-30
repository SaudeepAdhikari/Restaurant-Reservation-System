import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  return (
    <div className="auth-container">
      <form className="auth-form">
        <h2>Login</h2>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button className="btn-primary" type="submit">Login</button>
  <div className="auth-link">Don't have an account? <Link to="/signup">Sign up</Link></div>
      </form>
    </div>
  );
}

export default Login;
