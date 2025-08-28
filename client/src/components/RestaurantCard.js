import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RestaurantCard.css';

function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <Link to={`/restaurant/${restaurant.id}`} className="card-link">
        <img src={restaurant.image} alt={restaurant.name} className="card-image" />
        <div className="card-content">
          <h3>{restaurant.name}</h3>
          <div className="card-rating">⭐ {restaurant.rating}</div>
          <div className="card-details">{restaurant.details}</div>
          <div className="card-location">{restaurant.location} • {restaurant.cuisine}</div>
        </div>
      </Link>
    </div>
  );
}

export default RestaurantCard;
