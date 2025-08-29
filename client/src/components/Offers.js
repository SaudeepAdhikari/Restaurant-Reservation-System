import React, { useEffect, useState, useRef } from 'react';
import './Offers.css';

const OFFERS = [
  { id: 1, title: '20% off at Pizzeria Napoli', image: '/assets/offer-pizza.jpg', discount: '20%', endsAt: Date.now() + 1000 * 60 * 60 * 6, topDeal: true },
  { id: 2, title: 'Buy 1 Get 1 - Cafe Mocha', image: '/assets/offer-cafe.jpg', discount: 'B1G1', endsAt: Date.now() + 1000 * 60 * 30, topDeal: false },
  { id: 3, title: '30% off at Sushi Central', image: '/assets/offer-sushi.jpg', discount: '30%', endsAt: Date.now() + 1000 * 60 * 60 * 24, topDeal: true },
  { id: 4, title: '15% off The Spice Route', image: '/assets/offer-indian.jpg', discount: '15%', endsAt: Date.now() + 1000 * 60 * 45, topDeal: false }
];

function formatRemaining(ms) {
  if (ms <= 0) return '00:00:00';
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hr = Math.floor(ms / (1000 * 60 * 60));
  return [hr, min, sec].map(n => String(n).padStart(2,'0')).join(':');
}

export default function Offers() {
  const [now, setNow] = useState(Date.now());
  const trackRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const slide = (dir=1) => {
    if (!trackRef.current) return;
    const w = trackRef.current.clientWidth;
    trackRef.current.scrollBy({ left: Math.round(w * 0.6) * dir, behavior: 'smooth' });
  };

  return (
    <section className="offers-section">
      <div className="offers-header">
        <h2>Offers & Deals</h2>
        <div className="offers-controls">
          <button onClick={() => slide(-1)}>‹</button>
          <button onClick={() => slide(1)}>›</button>
        </div>
      </div>
      <div className="offers-track" ref={trackRef}>
        {OFFERS.map(o => (
          <div key={o.id} className={`offer-card ${o.topDeal ? 'top' : ''}`}>
            {o.topDeal && <div className="offer-glow">Top Deal</div>}
            <img src={o.image} alt={o.title} />
            <div className="offer-body">
              <h3>{o.title}</h3>
              <div className="offer-meta">
                <div className="offer-discount">{o.discount}</div>
                <div className="offer-countdown">{formatRemaining(o.endsAt - now)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
