import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Tables.css';

function TablesList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    authFetch('/api/owner/restaurants').then(rests => {
      Promise.all(rests.map(r => authFetch(`/api/owner/tables/restaurant/${r._id}`)))
        .then(arr => {
          setList(arr.flat());
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const toggleAvailability = async (tableId, current) => {
    try {
      await authFetch(`/api/owner/bookings/tables/${tableId}/availability`, { method: 'PUT', body: JSON.stringify({ available: !current }) });
      setList(list.map(l => l._id === tableId ? { ...l, available: !current } : l));
    } catch (err) {
      console.error('Failed to update availability', err);
      alert(err.message || 'Failed to update');
    }
  };

  // Helper to determine shape based on capacity
  const getTableShape = (capacity) => {
    if (capacity <= 2) return 'circle';
    if (capacity <= 4) return 'square';
    return 'rectangle';
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

  return (
    <div className="tables-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Floor Plan</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your restaurant layout and table availability</p>
        </div>
        <Link to="/tables/new" className="btn-base btn-primary">
          + Add Table
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪑</div>
          <h3>No Tables Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start by adding tables to your restaurants.</p>
          <Link to="/tables/new" className="btn-base btn-primary">Add Table</Link>
        </div>
      ) : (
        <>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#10b981' }}></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#ef4444' }}></div>
              <span>Occupied / Unavailable</span>
            </div>
          </div>

          <div className="tables-floor-plan">
            <div className="tables-grid">
              {list.map(t => {
                const shape = getTableShape(t.capacity);
                return (
                  <div key={t._id} className="table-item">
                    <div className="table-info-tooltip">
                      <strong>{t.name}</strong><br />
                      Capacity: {t.capacity}<br />
                      {t.restaurantId?.name}
                    </div>

                    <div
                      className={`table-shape ${shape} ${t.available ? 'available' : 'unavailable'}`}
                      onClick={() => toggleAvailability(t._id, t.available)}
                    >
                      {t.name}
                    </div>

                    <div className="table-controls">
                      <button
                        className="table-action-btn"
                        onClick={(e) => { e.stopPropagation(); toggleAvailability(t._id, t.available); }}
                      >
                        {t.available ? 'Block' : 'Open'}
                      </button>
                      <button
                        className="table-action-btn"
                        style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                        onClick={(e) => { e.stopPropagation(); alert('Delete coming soon'); }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TablesList;
