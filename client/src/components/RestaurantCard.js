import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import Button from './common/Button';
import '../styles/RestaurantCard.css';

function RestaurantCard({ restaurant, image, name, rating, cuisine, location, trending }) {
  const data = restaurant || { image, name, rating, cuisine, location, trending };
  const [liked, setLiked] = useState(false);
  const id = data._id || data.id || '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className={`premium-restaurant-card ${data.trending ? 'is-trending' : ''}`}
    >
      <Link to={`/restaurant/${id}`} className="card-anchor">
        <div className="image-container">
          <img
            src={(data.images && data.images[0]) || data.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'}
            alt={data.name}
            className="main-image"
          />
          <div className="card-overlay" />
          
          <button
            className={`heart-btn ${liked ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setLiked(s => !s); }}
          >
            <Heart size={20} fill={liked ? "var(--error)" : "none"} stroke={liked ? "var(--error)" : "white"} />
          </button>
          
          {data.trending && (
            <div className="trending-tag">
              <Star size={12} fill="white" />
              Trending
            </div>
          )}
        </div>

        <div className="details-container">
          <div className="details-header">
            <h3 className="restaurant-name">{data.name}</h3>
            <div className="rating-pill">
              <Star size={14} fill="currentColor" />
              {data.rating || '4.5'}
            </div>
          </div>
          
          <p className="cuisine-text">{data.cuisine || 'International'}</p>
          
          <div className="location-info">
            <MapPin size={14} />
            <span>{data.location || 'Downtown'}</span>
          </div>

          <div className="card-actions-row">
            <Button variant="primary" size="small" className="action-button">
              Book Table
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default RestaurantCard;


