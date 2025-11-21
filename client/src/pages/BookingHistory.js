import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/Booking.css';
import Spinner from '../components/common/Spinner';

function BookingHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  const fetchList = useCallback(() => {
    setLoading(true);
    setError(null);
    const target = `${base}/api/bookings/customer`;
    fetch(target, { credentials: 'include' })
      .then(async res => {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('text/html')) {
          const rel = await fetch('/api/bookings/customer', { credentials: 'include' });
          if (rel.status === 401) { navigate('/login'); throw new Error('Unauthorized'); }
          if (!rel.ok) throw new Error(`HTTP ${rel.status}`);
          return rel.json();
        }
        if (res.status === 401) { navigate('/login'); throw new Error('Unauthorized'); }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setList(data || []))
      .catch(err => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, [base, navigate]);

  useEffect(() => {
    fetchList();
    const onStorage = (e) => { if (e.key === 'booking_refresh') fetchList(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchList]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">View your past and upcoming reservations.</p>
      </div>

      <div className="page-container">
        {loading && <div className="flex-center" style={{ padding: '4rem' }}><Spinner size={40} /></div>}

        {error && (
          <div className="error-state">
            Failed to load bookings: {error}
            <div style={{ marginTop: '1rem' }}>
              <button className="btn-primary" onClick={fetchList}>Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>You haven't made any reservations yet.</p>
            <Link to="/restaurants" className="btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>Find a Restaurant</Link>
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="booking-history-list">
            {list.map(b => (
              <div key={b._id} className="booking-card">
                <div className="booking-info">
                  <h3>{b.restaurantId?.name || 'Restaurant'}</h3>
                  <div className="booking-details">
                    <span>{b.date}</span>
                    <span>{b.time}</span>
                    <span>{b.guests} Guests</span>
                  </div>
                </div>
                <span className={`booking-status status-${b.status || 'pending'}`}>
                  {b.status || 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingHistory;

