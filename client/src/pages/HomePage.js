import React from 'react';
import Navbar from '../components/common/Navbar';
import styles from '../styles/modules/HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homeWrapper}>
      <Navbar />
      <section className={styles.heroSection}>
        <div className={styles.heroBg}></div>
        <div className={styles.heroContent}>
          <h1>Find & Book the Best Restaurants</h1>
          <p>Discover trending places, exclusive offers, and book your table instantly.</p>
          <div className={styles.searchBarWrapper}>
            <input className={styles.searchBar} placeholder="Search by name, cuisine, or location..." />
            <button className={styles.searchBtn}>Search</button>
          </div>
          <div className={styles.quickFilters}>
            <span>Pizza</span>
            <span>Nepali</span>
            <span>Indian</span>
            <span>Cafés</span>
            <span>Chinese</span>
          </div>
        </div>
      </section>
      {/* Add carousel, banners, and more sections here */}
    </div>
  );
}

export default HomePage;
