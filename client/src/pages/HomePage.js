import React, { useEffect, useState } from 'react';
// Navbar rendered globally in App.js
import HeroTagline from '../components/HeroTagline';
import HeroBackground from '../components/HeroBackground';
import SearchBar from '../components/SearchBar';
import CategoryCarousel from '../components/CategoryCarousel';
import RestaurantCard from '../components/RestaurantCard';
import Offers from '../components/Offers';
import styles from '../styles/modules/HomePage.module.css';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoadingRestaurants(true);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/restaurants`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => { if (mounted) { setRestaurants(data || []); setRestaurantsError(null); } })
      .catch(err => { console.error('Failed to fetch restaurants', err); if (mounted) { setRestaurants([]); setRestaurantsError(err.message || String(err)); } })
      .finally(() => { if (mounted) setLoadingRestaurants(false); });
    return () => { mounted = false; };
  }, []);
  return (
    <div className={styles.homeWrapper}>
      <section className={styles.heroSection}>
        <HeroBackground />
        <div className={styles.heroContent}>
          <h1>Find & Book the Best Restaurants</h1>
          <HeroTagline />
          <p>Discover trending places, exclusive offers, and book your table instantly.</p>
          <div className={styles.searchBarWrapper}>
            {/* SearchBar component: autocomplete, voice, filters */}
            <SearchBar />
          </div>
          <button className={styles.primaryCta}>Explore Restaurants</button>
          <CategoryCarousel />

          <div className="restaurant-grid-wrapper">
            <h2 style={{marginTop: '1.5rem', color: 'var(--color-dark)'}}>Popular near you</h2>
            <div className="restaurant-grid">
              {loadingRestaurants && <p>Loading restaurants...</p>}
              {restaurantsError && <p style={{color:'crimson'}}>Failed to load restaurants: {restaurantsError}</p>}
              {!loadingRestaurants && !restaurantsError && restaurants.length === 0 && <p>No restaurants found.</p>}
              {!loadingRestaurants && !restaurantsError && restaurants.map(r => (
                <RestaurantCard key={r._id} restaurant={r} />
              ))}
            </div>
          </div>
        </div>
      </section>
  <Offers />
      {/* Add carousel, banners, and more sections here */}
    </div>
  );
}

export default HomePage;
