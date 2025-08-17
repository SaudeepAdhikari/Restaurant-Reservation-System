import React from 'react';
import './RestaurantDetails.css';

// Dummy data for demonstration
const DUMMY_MENU = [
  { id: 1, name: 'Spaghetti Carbonara', price: 14, description: 'Classic Italian pasta with pancetta and egg.' },
  { id: 2, name: 'Margherita Pizza', price: 12, description: 'Tomato, mozzarella, basil.' },
  { id: 3, name: 'Tiramisu', price: 7, description: 'Coffee-flavored Italian dessert.' },
];
const DUMMY_TABLES = [
  { id: 1, name: 'Table 1', seats: 4, status: 'available' },
  { id: 2, name: 'Table 2', seats: 2, status: 'reserved' },
  { id: 3, name: 'Table 3', seats: 6, status: 'available' },
];

function RestaurantDetails({ restaurant = {
  name: 'Olive Garden',
  location: 'New York',
  description: 'A cozy Italian restaurant with a wide selection of pasta and wine.',
  hours: '11:00 AM - 10:00 PM',
}, menu = DUMMY_MENU, tables = DUMMY_TABLES, onReserve }) {
  return (
    <div className="restaurant-details-wrapper">
      <div className="restaurant-details-header">
        <h2>{restaurant.name}</h2>
        <div className="restaurant-details-meta">
          <span>{restaurant.location}</span> | <span>{restaurant.hours}</span>
        </div>
        <p className="restaurant-details-desc">{restaurant.description}</p>
      </div>
      <div className="restaurant-details-section">
        <h3>Menu</h3>
        <ul className="menu-list">
          {menu.map(item => (
            <li key={item.id} className="menu-item">
              <div className="menu-item-main">
                <span className="menu-item-name">{item.name}</span>
                <span className="menu-item-price">${item.price}</span>
              </div>
              <div className="menu-item-desc">{item.description}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="restaurant-details-section">
        <h3>Available Tables</h3>
        <div className="tables-list">
          {tables.filter(t => t.status === 'available').length === 0 ? (
            <div className="no-tables">No tables available at the moment.</div>
          ) : (
            tables.filter(t => t.status === 'available').map(table => (
              <div className="table-card" key={table.id}>
                <div className="table-card-info">
                  <span className="table-card-name">{table.name}</span>
                  <span className="table-card-seats">Seats: {table.seats}</span>
                </div>
                <button className="reserve-btn" onClick={() => onReserve && onReserve(table)}>
                  Reserve
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;
