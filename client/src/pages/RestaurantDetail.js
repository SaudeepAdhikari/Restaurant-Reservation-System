import React from 'react';
import '../styles/RestaurantDetail.css';
import MenuSection from '../components/MenuSection';
import BookingModal from '../components/BookingModal';

function RestaurantDetail() {
  // Mock data for demonstration
  const restaurant = {
    name: 'Green Leaf Bistro',
    image: '/assets/greenleaf.jpg',
    rating: 4.7,
    details: 'Fresh, organic, and delicious Italian cuisine.',
    menu: [
      { name: 'Margherita Pizza', price: '$12' },
      { name: 'Pasta Primavera', price: '$14' },
      { name: 'Tiramisu', price: '$7' }
    ],
    tables: [
      { id: 1, time: '6:00 PM', available: true },
      { id: 2, time: '7:00 PM', available: false },
      { id: 3, time: '8:00 PM', available: true }
    ]
  };

  return (
    <div className="restaurant-detail">
      <img className="detail-image" src={restaurant.image} alt={restaurant.name} />
      <div className="detail-info">
        <h2>{restaurant.name}</h2>
        <div className="rating">⭐ {restaurant.rating}</div>
        <p>{restaurant.details}</p>
        <MenuSection menu={restaurant.menu} />
        <BookingModal tables={restaurant.tables} />
      </div>
    </div>
  );
}

export default RestaurantDetail;
