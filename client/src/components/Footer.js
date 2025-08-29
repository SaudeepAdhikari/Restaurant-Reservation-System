import React, { useState } from 'react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    // placeholder: integrate real API
    if (!email || !email.includes('@')) return alert('Please enter a valid email');
    setSubscribed(true);
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="newsletter">
          <h3>Subscribe to our newsletter</h3>
          <p>Get updates on latest offers and restaurants.</p>
          <form onSubmit={subscribe} className="newsletter-form">
            <input type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
            <button type="submit">{subscribed ? 'Subscribed' : 'Subscribe'}</button>
          </form>
        </div>

        <div className="socials">
          <h4>Follow us</h4>
          <div className="social-icons">
            <a href="#" aria-label="facebook" className="soc">🔵</a>
            <a href="#" aria-label="twitter" className="soc">🔷</a>
            <a href="#" aria-label="instagram" className="soc">🟣</a>
          </div>
        </div>

        <div className="quick-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Restaurants</a></li>
            <li><a href="#">Offers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="contact">
          <h4>Contact</h4>
          <p>support@restro.com</p>
          <p>+1 (555) 123-4567</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Your Restro. All rights reserved.</p>
      </div>
    </footer>
  );
}
