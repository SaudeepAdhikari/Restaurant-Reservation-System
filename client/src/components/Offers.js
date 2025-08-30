import React, { useEffect, useState, useRef } from 'react';
import './Offers.css';

// Offers will be loaded from the backend (if available). No mocked data here.

function formatRemaining(ms) {
  if (ms <= 0) return '00:00:00';
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hr = Math.floor(ms / (1000 * 60 * 60));
  return [hr, min, sec].map(n => String(n).padStart(2,'0')).join(':');
}

export default function Offers() {
  const [now, setNow] = useState(Date.now());
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/offers`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => { if (mounted) setOffers(Array.isArray(data) ? data : []); })
      .catch(err => { console.debug('No offers endpoint or failed to load offers', err); if (mounted) setOffers([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
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
        {loading && <div style={{padding:16}}>Loading offers...</div>}
        {!loading && offers.length === 0 && <div style={{padding:16}}>No offers found.</div>}
        {!loading && offers.map(o => (
          <div key={o.id} className={`offer-card ${o.topDeal ? 'top' : ''}`}>
            {o.topDeal && <div className="offer-glow">Top Deal</div>}
            <img src={o.image || '/assets/placeholder.jpg'} alt={o.title} />
            <div className="offer-body">
              <h3>{o.title}</h3>
              <div className="offer-meta">
                <div className="offer-discount">{o.discount}</div>
                <div className="offer-countdown">{formatRemaining((o.endsAt || 0) - now)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
