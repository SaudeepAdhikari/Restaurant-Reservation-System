import React from 'react';
import '../styles/Booking.css';

function BookingConfirmation() {
  return (
    <div className="booking-confirmation">
      <h2>Booking Confirmed!</h2>
      <p>Your table has been reserved. We look forward to serving you.</p>
      <a className="btn-primary" href="/booking/history">View Booking History</a>
    </div>
  );
}

export default BookingConfirmation;
