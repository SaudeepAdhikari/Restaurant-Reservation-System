import React, { useEffect, useState } from 'react';
import './Offers.css';
import Button from './common/Button';
import Spinner from './common/Spinner';

function formatRemaining(ms) {
  if (ms <= 0) return 'Expired';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hr = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hr}h left`;
  return `${hr}h ${min}m left`;
}

export default function Offers() {
  const [now, setNow] = useState(Date.now());
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000); // Update every minute
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
          const normalized = arr.map(o => ({
            _id: o._id,
            title: o.title,
            description: o.description,
            image: o.image ? (o.image.startsWith('http') ? o.image : `${base}${o.image}`) : '/assets/placeholder.jpg',
            endsAt: o.endDate ? Date.parse(o.endDate) : null,
            restaurantName: o.restaurantId && o.restaurantId.name ? o.restaurantId.name : '',
            promoCode: o.promoCode,
            discountPercent: o.discountPercent
          }));
          setOffers(normalized);
        }
      })
      .catch(err => { console.debug('Failed to load offers', err); if (mounted) setOffers([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="flex-center" style={{ padding: '4rem' }}><Spinner size={40} /></div>;
  if (offers.length === 0) return <div className="empty-state"><h3>No offers available</h3><p>Check back later for exclusive deals.</p></div>;

  return (
    <div className="offers-grid">
      {offers.map(o => (
        <OfferCard key={o._id} offer={o} now={now} />
      ))}
    </div>
  );
}

function OfferCard({ offer, now }) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);

  function apply() {
    if (!code) return;
    if (offer.promoCode && code.trim().toLowerCase() === String(offer.promoCode).toLowerCase()) {
      setApplied({ valid: true, percent: offer.discountPercent || 0 });
    } else {
      setApplied({ valid: false });
    }
  }

  return (
    <div className="offer-card">
      <div className="offer-image-wrapper">
        <img className="offer-image" src={offer.image} alt={offer.title} />
        {offer.endsAt && (
          <div className="offer-badge">
            {formatRemaining(offer.endsAt - now)}
          </div>
        )}
      </div>

      <div className="offer-content">
        <h3 className="offer-title">{offer.title}</h3>
        <p className="offer-desc">{offer.description}</p>

        <div className="offer-meta">
          <span>{offer.restaurantName || 'Restaurant'}</span>
          <span>{offer.discountPercent ? `${offer.discountPercent}% OFF` : 'Special Deal'}</span>
        </div>

        <div className="promo-section">
          <input
            className="promo-input"
            placeholder="Promo code"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Button size="small" onClick={apply} variant="primary">Apply</Button>
        </div>

        {applied && (
          <div className={`promo-status ${applied.valid ? 'promo-success' : 'promo-error'}`}>
            {applied.valid ? `Success! ${applied.percent}% discount applied.` : 'Invalid promo code.'}
          </div>
        )}
      </div>
    </div>
  );
}

