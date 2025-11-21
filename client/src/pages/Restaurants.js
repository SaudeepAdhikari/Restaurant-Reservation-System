import React, { useEffect, useState } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import Spinner from '../components/common/Spinner';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/restaurants`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data && Array.isArray(data.value)) {
          setRestaurants(data.value);
        } else if (data && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          setRestaurants([]);
          setError('Unexpected response shape from server');
        }
        setError(null);
      })
      .catch(err => { console.error('Failed to fetch restaurants', err); if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">All Restaurants</h1>
        <p className="page-subtitle">Discover the best dining experiences near you. Filter by cuisine, location, or name.</p>
      </div>

      <div className="page-container">
        <div className="filters-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search restaurants or cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <div className="flex-center" style={{ padding: '4rem' }}><Spinner size={40} /></div>}
        {error && <div className="error-state">Failed to load restaurants: {error}</div>}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <div className="empty-state">
            <h3>No restaurants found</h3>
            <p>Try adjusting your search terms.</p>
          </div>
        )}

        <div className="grid-responsive">
          {filteredRestaurants.map(r => (
            <RestaurantCard key={r._id || r.id} restaurant={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

