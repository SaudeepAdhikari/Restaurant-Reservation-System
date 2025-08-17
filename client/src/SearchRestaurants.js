import React, { useState } from 'react';
import './SearchRestaurants.css';

const DUMMY_RESTAURANTS = [
  { id: 1, name: 'Olive Garden', location: 'New York', cuisine: 'Italian' },
  { id: 2, name: 'Sushi Zen', location: 'San Francisco', cuisine: 'Japanese' },
  { id: 3, name: 'Taco Fiesta', location: 'Austin', cuisine: 'Mexican' },
  { id: 4, name: 'Curry House', location: 'Chicago', cuisine: 'Indian' },
  { id: 5, name: 'Le Petit Paris', location: 'Los Angeles', cuisine: 'French' },
];

function SearchRestaurants() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(DUMMY_RESTAURANTS);

  const handleChange = e => {
    const val = e.target.value;
    setQuery(val);
    const q = val.toLowerCase();
    setResults(
      DUMMY_RESTAURANTS.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q)
      )
    );
  };

  return (
    <div className="search-restaurants-wrapper">
      <h2>Search Restaurants</h2>
      <input
        className="search-input"
        type="text"
        placeholder="Search by name, location, or cuisine..."
        value={query}
        onChange={handleChange}
      />
      <div className="restaurant-cards">
        {results.length === 0 ? (
          <div className="no-results">No restaurants found.</div>
        ) : (
          results.map(r => (
            <div className="restaurant-card" key={r.id}>
              <div className="restaurant-card__info">
                <div className="restaurant-card__name">{r.name}</div>
                <div className="restaurant-card__meta">
                  <span>{r.location}</span> | <span>{r.cuisine}</span>
                </div>
              </div>
              <button className="view-details-btn">View Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchRestaurants;
