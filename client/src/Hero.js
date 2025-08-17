import React from 'react';
import './Hero.css';

function Hero({ onBookNow }) {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">Reserve Your Table Easily</h1>
        <p className="hero-subtext">Experience fine dining and effortless reservations at BistroBook. Book your table in just a few clicks!</p>
        <button className="hero-cta" onClick={onBookNow}>Book Now</button>
      </div>
    </section>
  );
}

export default Hero;
