import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RestaurantCard.css';
import Card from './common/Card';
import Button from './common/Button';

function RestaurantCard({ restaurant, image, name, rating, cuisine, location, trending }) {
  const data = restaurant || { image, name, rating, cuisine, location, trending };
  const [liked, setLiked] = useState(false);
  const id = data._id || data.id || '';

  return (
    <Card className={`restaurant-card ${data.trending ? 'trending' : ''}`} hover={true}>
      <Link to={`/restaurant/${id}`} className="card-link">
        <div className="card-media">
          <img
            src={(data.images && data.images[0]) || data.image || '/assets/placeholder.jpg'}
            alt={data.name}
            className="card-image"
          />
          <button
            className={`like-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => { e.preventDefault(); setLiked(s => !s); }}
            aria-label="Save restaurant"
          >
            ❤
          </button>
          {data.trending && <span className="trending-badge">Trending</span>}
        </div>
        <div className="card-content">
          <div className="card-header">
            <h3 className="card-title">{data.name}</h3>
            <div className="card-rating">
              <span className="star">★</span> {data.rating}
            </div>
          </div>
          <p className="card-info">{data.cuisine} • {data.location}</p>
          <div className="card-footer">
            <Button variant="primary" size="small" className="book-btn">Book Table</Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}

export default RestaurantCard;

