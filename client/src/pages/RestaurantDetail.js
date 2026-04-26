import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MenuSection from '../components/MenuSection';
import BookingModal from '../components/BookingModal';
import Card from '../components/common/Card';
import './RestaurantDetail.css';

function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';

    fetch(`${base}/api/restaurants/${id}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => { if (mounted) setRestaurant(data); })
      .catch(err => { if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });

    fetch(`${base}/api/tables/restaurant/${id}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(list => { if (mounted) setTables(list || []); })
      .catch(() => { if (mounted) setTables([]); });

    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="flex-center" style={{ padding: '10rem' }}>Loading Restaurant...</div>;
  if (error) return <div className="flex-center" style={{ padding: '10rem' }}>Error: {error}</div>;
  if (!restaurant) return <div className="flex-center" style={{ padding: '10rem' }}>Restaurant not found.</div>;

  return (
    <div className="restaurant-detail-page">
      <div className="detail-hero">
        <img className="detail-hero-image" src={restaurant.image || '/assets/placeholder.jpg'} alt={restaurant.name} />
        <div className="detail-hero-overlay">
          <div className="detail-hero-content">
            <h1 className="detail-title">{restaurant.name}</h1>
            <div className="detail-meta">
              <span>⭐ {restaurant.rating || 'New'}</span>
              <span>•</span>
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span>{restaurant.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-main">
          <div className="info-card">
            <h2 className="section-title">About</h2>
            <p className="about-text">{restaurant.description || 'No description available.'}</p>
          </div>

          <div className="info-card">
            <MenuSection menu={restaurant.menu} />
          </div>

          <div className="info-card">
            <h2 className="section-title">Available Tables</h2>
            <ul className="table-list">
              {tables.map(t => (
                <li key={t._id} className={`table-item ${t.available ? 'available' : 'unavailable'}`}>
                  <strong>{t.name}</strong>
                  <div>Capacity: {t.capacity}</div>
                </li>
              ))}
            </ul>
            {tables.length === 0 && <p>No table information available.</p>}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="sticky-sidebar-content">
            <div className="info-card">
              <h2 className="section-title">Reservation</h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
                Select your preferred table and time to secure your booking instantly.
              </p>
              <BookingModal tables={tables} restaurantId={restaurant._id || restaurant.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;
