import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import '../styles/Booking.css';

function BookingConfirmation() {
  const { state } = useLocation();
  const { id } = useParams();
  const bookingWrapper = state && state.booking ? state.booking : null;
  const initialBooking = bookingWrapper && bookingWrapper.booking ? bookingWrapper.booking : bookingWrapper;
  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(!initialBooking && !!id);
  const [error, setError] = useState(null);
  const detailsRef = useRef(null);

  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!booking && id) {
      setLoading(true);
      fetch(`${base}/api/bookings/${id}`)
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(b => setBooking(b))
        .catch(err => setError(err.message || String(err)))
        .finally(() => setLoading(false));
    }
  }, [id, booking, base]);

  useEffect(() => {
    if (booking && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [booking]);

  return (
    <div className="booking-confirmation">
      <h2>Booking Confirmed!</h2>
      {loading && <div>Loading booking details...</div>}
      {error && <div className="error">Failed to load booking: {error}</div>}
      {booking ? (
        <div className="booking-details" ref={detailsRef}>
          <p><strong>Restaurant:</strong> {booking.restaurantId?.name || booking.restaurantId}</p>
          <p><strong>Date:</strong> {booking.date}</p>
          <p><strong>Time:</strong> {booking.time}</p>
          <p><strong>Guests:</strong> {booking.guests}</p>
          <p><strong>Table:</strong> {booking.table || '—'}</p>
        </div>
      ) : (!loading && <p>Your table has been reserved. We look forward to serving you.</p>)}
      <Link className="btn-primary" to="/booking/history">View Booking History</Link>
    </div>
  );
}

export default BookingConfirmation;
