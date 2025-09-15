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
    const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';
    fetch(`${base}/api/offers`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (mounted) {
          const arr = Array.isArray(data) ? data : [];
          // normalize fields to what the UI expects
          const normalized = arr.map(o => ({
            _id: o._id,
            title: o.title,
            description: o.description,
            image: o.image ? (o.image.startsWith('http') ? o.image : `${base}${o.image}`) : '/assets/placeholder.jpg',
            endsAt: o.endDate ? Date.parse(o.endDate) : null,
            restaurantName: o.restaurantId && o.restaurantId.name ? o.restaurantId.name : ''
          }));
          setOffers(normalized);
        }
      })
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
          <OfferCard key={o._id} offer={o} now={now} />
        ))}
      </div>
    </section>
  );
}

function OfferCard({ offer, now }) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);

  function apply() {
    if (!code) return;
    // since promo validation should be server-side in real apps, we do basic client-side check
    if (offer.promoCode && code.trim().toLowerCase() === String(offer.promoCode).toLowerCase()) {
      setApplied({ valid: true, percent: offer.discountPercent || 0 });
    } else {
      setApplied({ valid: false });
    }
  }

  return (
    <div className="offer-card">
      <img src={offer.image} alt={offer.title} />
      <div className="offer-body">
        <h3>{offer.title}</h3>
        <div className="offer-desc">{offer.description}</div>
        <div className="offer-meta small">{offer.restaurantName} • {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : '—'}</div>
        <div className="offer-countdown small">{offer.endsAt ? formatRemaining(offer.endsAt - now) : ''}</div>

        <div style={{marginTop:12}}>
          <input placeholder="Promo code" value={code} onChange={e => setCode(e.target.value)} style={{padding:'8px 10px',borderRadius:8,border:'1px solid #e6eef0'}} />
          <button onClick={apply} style={{marginLeft:8,padding:'8px 10px',borderRadius:8,background:'#0f766e',color:'#fff',border:'none'}}>Apply</button>
        </div>
        {applied && (
          <div style={{marginTop:8}} className="small">{applied.valid ? `Promo applied: ${applied.percent}% off` : 'Invalid promo code'}</div>
        )}
      </div>
    </div>
  );
}
