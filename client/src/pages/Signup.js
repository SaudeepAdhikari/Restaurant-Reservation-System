import React from 'react';
import '../styles/Auth.css';

function Signup() {
  return (
    <div className="auth-container">
      <form className="auth-form">
        <h2>Sign Up</h2>
        <input type="text" placeholder="Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button className="btn-primary" type="submit">Sign Up</button>
        <div className="auth-link">Already have an account? <a href="/login">Login</a></div>
      </form>
    </div>
  );
}

export default Signup;
