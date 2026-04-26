import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Clock, CheckCircle, XCircle, ChevronRight, Gift } from 'lucide-react';
import Button from './common/Button';
import './Offers.css';

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
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/offers`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (mounted) {
          const arr = Array.isArray(data) ? data : [];
          const normalized = arr.map(o => ({
            ...o,
            image: o.image ? (o.image.startsWith('http') ? o.image : `${base}${o.image}`) : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
            endsAt: o.endDate ? Date.parse(o.endDate) : null,
          }));
          setOffers(normalized);
        }
      })
      .catch(() => { if (mounted) setOffers([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="offers-skeleton-grid">
      {[1, 2, 3].map(i => <div key={i} className="offer-skeleton" />)}
    </div>
  );

  if (offers.length === 0) return (
    <div className="empty-offers">
      <Gift size={48} className="text-muted" />
      <h3>No Active Offers</h3>
      <p>Check back later for exclusive dining deals.</p>
    </div>
  );

  return (
    <div className="offers-container">
      <div className="section-header">
        <h2 className="section-title">Exclusive Deals</h2>
        <p className="section-subtitle">Handpicked offers just for you</p>
      </div>
      <div className="offers-premium-grid">
        {offers.map((o, idx) => (
          <OfferCard key={o._id} offer={o} now={now} index={idx} />
        ))}
      </div>
    </div>
  );
}

function OfferCard({ offer, now, index }) {
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
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="premium-offer-card"
    >
      <div className="offer-visual">
        <img src={offer.image} alt={offer.title} />
        <div className="offer-gradient-overlay" />
        {offer.endsAt && (
          <div className="time-badge">
            <Clock size={12} />
            {formatRemaining(offer.endsAt - now)}
          </div>
        )}
        <div className="discount-floating">
          {offer.discountPercent}% OFF
        </div>
      </div>

      <div className="offer-details">
        <div className="offer-brand">
          <Tag size={14} className="text-primary" />
          {offer.restaurantId?.name || 'Gourmet Partner'}
        </div>
        <h3 className="offer-heading">{offer.title}</h3>
        <p className="offer-subheading">{offer.description}</p>

        <div className="promo-interaction">
          <div className="promo-input-group">
            <input
              placeholder="Enter promo code"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <Button size="small" onClick={apply}>Apply</Button>
          </div>
          
          <AnimatePresence>
            {applied && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`promo-feedback ${applied.valid ? 'success' : 'error'}`}
              >
                {applied.valid ? (
                  <><CheckCircle size={14} /> Code Applied!</>
                ) : (
                  <><XCircle size={14} /> Invalid Code</>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}


