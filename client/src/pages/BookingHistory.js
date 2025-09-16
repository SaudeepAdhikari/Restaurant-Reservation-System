import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

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
    // Try absolute base first, then fallback to relative path if 404 (proxy issues / different host)
    fetch(target, { credentials: 'include' })
      .then(async res => {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        // If the server responded with HTML, it likely means the request hit the frontend dev server
        if (ct.includes('text/html')) {
          // try a relative fallback
          const rel = await fetch('/api/bookings/customer', { credentials: 'include' });
          const relCt = (rel.headers.get('content-type') || '').toLowerCase();
          if (relCt.includes('text/html')) {
            throw new Error('Received HTML response from API (likely backend not running or proxy misconfigured)');
          }
          if (rel.status === 401) { navigate('/login'); throw new Error('Unauthorized'); }
          if (!rel.ok) throw new Error(`HTTP ${rel.status}`);
          return rel.json();
        }

        if (res.status === 401) {
          // not authenticated
          navigate('/login');
          throw new Error('Unauthorized');
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setList(data || []))
      .catch(err => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, [base, navigate]);

  useEffect(() => {
    fetchList();
    const onStorage = (e) => {
      if (e.key === 'booking_refresh') fetchList();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchList]);

  return (
    <div className="booking-history">
      <h2>Your Bookings</h2>
      {loading && <div>Loading...</div>}
      {error && (
        <div className="error">Failed to load bookings: {error}
          <div style={{marginTop:8}}>
            <div style={{marginBottom:8}}>If you see an HTML response or this persists, ensure the backend is running at the expected URL or that your dev proxy is configured.</div>
            <button className="btn-primary" onClick={fetchList}>Retry</button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <ul>
          {list.map(b => (
            <li key={b._id} className="history-item">
              <Link to={`/restaurant/${b.restaurantId?._id || b.restaurantId}`}>{b.restaurantId?.name || 'Restaurant'}</Link>
              <span>{b.date} at {b.time}</span>
              <span className={b.status === 'completed' ? 'status-completed' : ''}>{b.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookingHistory;
