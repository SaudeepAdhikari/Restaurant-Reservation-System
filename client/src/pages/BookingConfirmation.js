import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import '../pages/Booking.css';
import Spinner from '../components/common/Spinner';

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
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Booking Confirmed</h1>
        <p className="page-subtitle">Your table reservation has been successfully placed.</p>
      </div>

      <div className="confirmation-page">
        {loading && <div className="flex-center"><Spinner size={40} /></div>}
        {error && <div className="error-state">Failed to load booking: {error}</div>}

        {booking ? (
          <div className="confirmation-card" ref={detailsRef}>
            <div className="success-icon">✓</div>
            <h2>Reservation Complete</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We've sent a confirmation email to your inbox.</p>

            <div className="confirmation-details">
              <div className="detail-row">
                <span className="detail-label">Restaurant</span>
                <span className="detail-value">{booking.restaurantId?.name || booking.restaurantId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{booking.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time</span>
                <span className="detail-value">{booking.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Guests</span>
                <span className="detail-value">{booking.guests} People</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Table</span>
                <span className="detail-value">{booking.table || 'Any Available'}</span>
              </div>
            </div>

            <Link className="btn-primary" to="/booking/history" style={{ textDecoration: 'none' }}>View My Bookings</Link>
          </div>
        ) : (!loading && (
          <div className="empty-state">
            <p>Your table has been reserved. We look forward to serving you.</p>
            <Link className="btn-primary" to="/booking/history" style={{ marginTop: '1rem', textDecoration: 'none' }}>View Booking History</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingConfirmation;

