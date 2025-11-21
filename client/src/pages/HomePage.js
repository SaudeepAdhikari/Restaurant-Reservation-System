import React, { useEffect, useState } from 'react';
import './HomePage.css';
import SearchBar from '../components/SearchBar';
import CategoryCarousel from '../components/CategoryCarousel';
import RestaurantCard from '../components/RestaurantCard';
import Offers from '../components/Offers';
import Button from '../components/common/Button';

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
    <div className="home-wrapper">
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Find & Book the <span className="text-gradient">Best Restaurants</span>
          </h1>
          <p className="hero-subtitle">
            Discover trending places, exclusive offers, and book your table instantly with our premium booking experience.
          </p>

          <div className="search-wrapper">
            <SearchBar />
          </div>

          <div className="hero-actions">
            <Button variant="primary" size="large" onClick={() => document.getElementById('restaurants-grid').scrollIntoView({ behavior: 'smooth' })}>
              Explore Restaurants
            </Button>
          </div>
        </div>
      </section>

      <CategoryCarousel />

      <section id="restaurants-grid" className="restaurant-grid-section">
        <h2 className="section-title">Popular near you</h2>

        {loadingRestaurants && <div className="loading-state">Loading restaurants...</div>}

        {restaurantsError && <div className="error-state">Failed to load restaurants: {restaurantsError}</div>}

        {!loadingRestaurants && !restaurantsError && restaurants.length === 0 && (
          <div className="empty-state">No restaurants found.</div>
        )}

        {!loadingRestaurants && !restaurantsError && (
          <div className="grid-responsive">
            {restaurants.map(r => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      <Offers />
    </div>
  );
}

export default HomePage;

