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

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

  return (
    <div className="bookings-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage reservations across all your restaurants</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {list.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3>No Bookings Yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Reservations will appear here once customers start booking.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {list.map(b => (
            <div className="booking-card" key={b._id}>
              <div className="booking-info">
                <div className="booking-customer">
                  <span className="customer-name">{b.customerId?.name || 'Guest Customer'}</span>
                  <span className="booking-meta">
                    {b.restaurantId?.name || 'Unknown Restaurant'}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    {new Date(b.date).toLocaleDateString()} at {b.time}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Guests:</span>
                    {b.guests} people
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Table:</span>
                    {b.table || 'Unassigned'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                <div className="card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  {b.status === 'pending' && (
                    <>
                      <button className="btn-base btn-sm btn-primary" onClick={() => updateStatus(b._id, 'confirmed')}>Confirm</button>
                      <button className="btn-base btn-sm btn-danger" onClick={() => updateStatus(b._id, 'cancelled')}>Decline</button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button className="btn-base btn-sm btn-danger" onClick={() => updateStatus(b._id, 'cancelled')}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;

