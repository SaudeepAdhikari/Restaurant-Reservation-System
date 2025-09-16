import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RestaurantDetail.css';
import MenuSection from '../components/MenuSection';
import BookingModal from '../components/BookingModal';

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

  if (loading) return <div className="restaurant-detail">Loading...</div>;
  if (error) return <div className="restaurant-detail">Failed to load restaurant: {error}</div>;
  if (!restaurant) return <div className="restaurant-detail">Restaurant not found.</div>;

  return (
    <div className="restaurant-detail">
      <img className="detail-image" src={restaurant.image || '/assets/placeholder.jpg'} alt={restaurant.name} />
      <div className="detail-info">
        <h2>{restaurant.name}</h2>
        <div className="rating">⭐ {restaurant.rating || '—'}</div>
        <p>{restaurant.description || restaurant.details || ''}</p>
        {restaurant.menu && <MenuSection menu={restaurant.menu} />}

        <section className="restaurant-tables">
          <h3>Available tables</h3>
          {tables.length === 0 && <p>No table information available.</p>}
          {tables.length > 0 && (
            <ul className="table-list">
              {tables.map(t => (
                <li key={t._id} className={`table-item ${t.available ? 'available' : 'unavailable'}`}>
                  <strong>{t.name}</strong> — capacity: {t.capacity} {t.location ? `· ${t.location}` : ''}
                </li>
              ))}
            </ul>
          )}
        </section>

        <BookingModal tables={tables} restaurantId={restaurant._id || restaurant.id} />
      </div>
    </div>
  );
}

export default RestaurantDetail;
