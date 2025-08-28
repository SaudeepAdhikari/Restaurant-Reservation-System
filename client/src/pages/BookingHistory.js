import React from 'react';
import '../styles/Booking.css';

const mockHistory = [
  { id: 1, restaurant: 'Green Leaf Bistro', date: '2025-08-20', time: '7:00 PM', status: 'Completed' },
  { id: 2, restaurant: 'Teal Table', date: '2025-08-15', time: '8:00 PM', status: 'Completed' }
];

function BookingHistory() {
  return (
    <div className="booking-history">
      <h2>Your Bookings</h2>
      <ul>
        {mockHistory.map(b => (
          <li key={b.id} className="history-item">
            <span>{b.restaurant}</span>
            <span>{b.date} at {b.time}</span>
            <span className={b.status === 'Completed' ? 'status-completed' : ''}>{b.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingHistory;
