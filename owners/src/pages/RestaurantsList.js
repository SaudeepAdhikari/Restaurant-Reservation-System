import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Restaurants.css';

function RestaurantsList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch('/api/owner/restaurants')
      .then(data => {
        setList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id, e) {
    e.preventDefault(); // Prevent navigation
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return;
    try {
      await authFetch(`/api/owner/restaurants/${id}`, { method: 'DELETE' });
      setList(l => l.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="restaurants-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Restaurants</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your restaurant locations</p>
        </div>
        <Link to="/restaurant/new" className="btn-base btn-primary">
          + Add Restaurant
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h3>No restaurants yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add your first restaurant to get started.</p>
          <Link to="/restaurant/new" className="btn-base btn-primary">Create Restaurant</Link>
        </div>
      ) : (
        <div className="restaurants-grid">
          {list.map(r => (
            <Link to={`/restaurant/${r._id}`} key={r._id} className="restaurant-card" style={{ textDecoration: 'none' }}>
              <div className="restaurant-image-container">
                {r.images && r.images.length ? (
                  <img src={r.images[0]} alt={r.name} className="restaurant-image" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                    No Image
                  </div>
                )}
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">{r.name}</h3>
                <div className="restaurant-meta">
                  <span>📍 {r.location}</span>
                </div>
                <p className="restaurant-description">{r.description || 'No description provided.'}</p>
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span className="btn-base btn-sm btn-secondary">Edit Details</span>
                <button
                  className="btn-base btn-sm btn-danger"
                  onClick={(e) => handleDelete(r._id, e)}
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantsList;

