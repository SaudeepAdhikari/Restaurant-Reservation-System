import React, { useEffect, useState } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import styles from '../styles/modules/Restaurants.module.css';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/restaurants`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        console.debug('Restaurants response', data);
        if (!mounted) return;
        // support both direct array responses and objects like { value: [...] }
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data && Array.isArray(data.value)) {
          setRestaurants(data.value);
        } else if (data && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          // unknown shape: store empty and surface a helpful message
          setRestaurants([]);
          setError('Unexpected response shape from server');
        }
        setError(null);
      })
      .catch(err => { console.error('Failed to fetch restaurants', err); if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className={styles.pageWrap}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1>All Restaurants</h1>
          <p className={styles.sub}>Discover restaurants near you — filter, explore, and book a table.</p>
        </header>

        <section className={styles.gridSection}>
          {loading && <div className={styles.msg}>Loading restaurants...</div>}
          {error && <div className={styles.msgError}>Failed to load restaurants: {error}</div>}
          {!loading && !error && restaurants.length === 0 && <div className={styles.msg}>No restaurants found.</div>}

          <div style={{marginTop: '0.5rem', color:'#345'}}>{!loading && !error && `Showing ${restaurants.length} restaurants`}</div>

          <div className={styles.grid}>
            {restaurants.map(r => (
              <RestaurantCard key={r._id || r.id} restaurant={r} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
