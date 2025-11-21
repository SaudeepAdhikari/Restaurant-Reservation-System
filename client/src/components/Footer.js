import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import Button from './common/Button';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return alert('Please enter a valid email');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>Your Restro</h3>
          <p>Discover the best dining experiences in your city. Book tables, view menus, and enjoy exclusive offers.</p>
          <div className="social-icons">
            <a href="#" className="social-link" aria-label="Facebook">FB</a>
            <a href="#" className="social-link" aria-label="Twitter">TW</a>
            <a href="#" className="social-link" aria-label="Instagram">IG</a>
            <a href="#" className="social-link" aria-label="LinkedIn">LI</a>
          </div>
        </div>

        <div className="footer-section footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/dashboard">Home</Link></li>
            <li><Link to="/restaurants">Restaurants</Link></li>
            <li><Link to="/offers">Offers</Link></li>
            <li><Link to="/booking/history">My Bookings</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-links">
          <h4>Support</h4>
          <ul>
            <li><Link to="#">Help Center</Link></li>
            <li><Link to="#">Terms of Service</Link></li>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Stay Updated</h4>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>Subscribe to our newsletter for the latest updates.</p>
          <form onSubmit={subscribe} className="newsletter-form">
            <input
              type="email"
              className="newsletter-input"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" size="medium">
              {subscribed ? '✓' : 'Go'}
            </Button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Your Restro. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="#">Privacy</Link>
          <Link to="#">Terms</Link>
          <Link to="#">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}


