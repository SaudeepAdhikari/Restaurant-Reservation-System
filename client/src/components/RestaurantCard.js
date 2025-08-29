import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RestaurantCard.css';

function RestaurantCard({ restaurant, image, name, rating, cuisine, location, trending }) {
  // Support both legacy prop "restaurant" and new props
  const data = restaurant || { image, name, rating, cuisine, location, trending };
  const [liked, setLiked] = useState(false);

  return (
    <div className={`restaurant-card new ${data.trending ? 'trending' : ''}`}>
      <Link to={`/restaurant/${data.id || ''}`} className="card-link">
        <div className="card-media">
          <img src={data.image} alt={data.name} className="card-image" />
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={(e) => { e.preventDefault(); setLiked(s => !s); }} aria-label="Save restaurant">❤</button>
          <div className="hover-cta">
            <button className="book-now">Book Now</button>
          </div>
        </div>
        <div className="card-content">
          <div className="card-title">
            <h3>{data.name}</h3>
            <div className="card-rating">{data.rating} ★</div>
          </div>
          <div className="card-details">{data.cuisine} · {data.location}</div>
        </div>
      </Link>
    </div>
  );
}

export default RestaurantCard;
