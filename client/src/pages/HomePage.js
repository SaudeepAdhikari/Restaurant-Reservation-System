import React from 'react';
import Navbar from '../components/common/Navbar';
import HeroTagline from '../components/HeroTagline';
import HeroBackground from '../components/HeroBackground';
import SearchBar from '../components/SearchBar';
import CategoryCarousel from '../components/CategoryCarousel';
import RestaurantCard from '../components/RestaurantCard';
import Offers from '../components/Offers';
import Footer from '../components/Footer';
import styles from '../styles/modules/HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homeWrapper}>
      <Navbar />
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
              <RestaurantCard
                name="Pizzeria Napoli"
                rating={4.6}
                cuisine="Italian"
                location="Downtown"
                image="/assets/pizza.jpg"
              />
              <RestaurantCard
                name="The Spice Route"
                rating={4.5}
                cuisine="Indian"
                location="Kathmandu"
                image="/assets/indian.jpg"
                trending
              />
              <RestaurantCard
                name="Café Mocha"
                rating={4.2}
                cuisine="Café"
                location="Riverside"
                image="/assets/cafe.jpg"
              />
              <RestaurantCard
                name="Sushi Central"
                rating={4.7}
                cuisine="Japanese"
                location="Harbor"
                image="/assets/sushi.jpg"
              />
            </div>
          </div>
        </div>
      </section>
      <Offers />
      {/* Footer */}
      <Footer />
      {/* Add carousel, banners, and more sections here */}
    </div>
  );
}

export default HomePage;
