import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './RestaurantDetail.css';
import MenuSection from '../components/MenuSection';
import BookingModal from '../components/BookingModal';
import Card from '../components/common/Card';

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

    // Fetch restaurant details
    fetch(`${base}/api/restaurants/${id}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => { if (!mounted) return; setRestaurant(data); })
      .catch(err => { console.error('Failed to fetch restaurant', err); if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });

    // Fetch public tables for this restaurant
    fetch(`${base}/api/tables/restaurant/${id}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(list => { if (!mounted) return; setTables(list || []); })
      .catch(err => { console.warn('Failed to fetch tables', err); if (mounted) setTables([]); });

    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="restaurant-detail-page flex-center">Loading...</div>;
  if (error) return <div className="restaurant-detail-page flex-center">Failed to load restaurant: {error}</div>;
  if (!restaurant) return <div className="restaurant-detail-page flex-center">Restaurant not found.</div>;

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
          <Card className="info-card">
            <h2 className="section-title">About</h2>
            <p>{restaurant.description || restaurant.details || 'No description available.'}</p>
          </Card>

          {restaurant.menu && (
            <Card className="info-card">
              <MenuSection menu={restaurant.menu} />
            </Card>
          )}

          <Card className="info-card">
            <h2 className="section-title">Available Tables</h2>
            {tables.length === 0 && <p>No table information available.</p>}
            {tables.length > 0 && (
              <ul className="table-list">
                {tables.map(t => (
                  <li key={t._id} className={`table-item ${t.available ? 'available' : 'unavailable'}`}>
                    <strong>{t.name}</strong>
                    <div>Capacity: {t.capacity}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="detail-sidebar">
          <Card className="info-card sticky-card">
            <h2 className="section-title">Make a Reservation</h2>
            <BookingModal tables={tables} restaurantId={restaurant._id || restaurant.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;

