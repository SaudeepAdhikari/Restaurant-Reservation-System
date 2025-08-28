import React from 'react';
import '../styles/Bookings.css';

const mockBookings = [
  { id: 1, customer: 'John Doe', date: '2025-08-28', time: '7:00 PM', table: 'Table 1', status: 'Confirmed' },
  { id: 2, customer: 'Jane Smith', date: '2025-08-29', time: '8:00 PM', table: 'Table 2', status: 'Pending' }
];

function Bookings() {
  return (
    <div className="bookings-page">
      <h2>Bookings</h2>
      <div className="bookings-list">
        {mockBookings.map(b => (
          <div className="booking-card" key={b.id}>
            <div><strong>{b.customer}</strong></div>
            <div>{b.date} at {b.time}</div>
            <div>Table: {b.table}</div>
            <div className={`status ${b.status.toLowerCase()}`}>{b.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bookings;
