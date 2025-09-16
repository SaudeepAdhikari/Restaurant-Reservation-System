import React, { useEffect, useState } from 'react';
import '../styles/Bookings.css';
import { authFetch } from '../utils/auth';

function Bookings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    authFetch('/api/owner/bookings')
      .then(data => setList(data || []))
      .catch(err => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await authFetch(`/api/owner/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      setList(list.map(l => l._id === id ? updated : l));
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  };

  return (
    <div className="bookings-page">
      <h2>Bookings</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="error">Failed to load bookings: {error}</div>}
      <div className="bookings-list">
        {list.map(b => (
          <div className="booking-card" key={b._id}>
            <div><strong>{b.customerId?.name || 'Customer'}</strong></div>
            <div>{b.date} at {b.time}</div>
            <div>Table: {b.table || '—'}</div>
            <div className={`status ${b.status.toLowerCase()}`}>{b.status}</div>
            <div className="card-actions">
              {b.status !== 'confirmed' && <button className="small-btn" onClick={() => updateStatus(b._id, 'confirmed')}>Confirm</button>}
              {b.status !== 'cancelled' && <button className="small-btn danger-btn" onClick={() => updateStatus(b._id, 'cancelled')}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bookings;
