import React from 'react';
import '../styles/Auth.css';

function Login() {
  return (
    <div className="auth-container">
      <form className="auth-form">
        <h2>Login</h2>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button className="btn-primary" type="submit">Login</button>
        <div className="auth-link">Don't have an account? <a href="/signup">Sign up</a></div>
      </form>
    </div>
  );
}

export default Login;
