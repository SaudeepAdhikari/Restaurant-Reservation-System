import React from 'react';
import './ReservationHistory.css';


function formatDate(dt, time) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString();
}
function formatTime(dt, time) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function getStatus(dt, time) {
  const now = new Date();
  const resTime = new Date(dt);
  return resTime > now ? 'Upcoming' : 'Past';
}

function ReservationHistory({ reservations }) {
  return (
    <section className="history-section">
      <h2 className="history-title">Your Reservations</h2>
      <div className="history-list">
        {reservations.length === 0 ? (
          <div className="history-empty">No reservations found.</div>
        ) : (
          reservations.map(r => (
            <div className="history-card" key={r.id}>
              <div className="history-row">
                <span className="history-label">Restaurant:</span>
                <span>{r.restaurantName || '-'}</span>
              </div>
              <div className="history-row">
                <span className="history-label">Date:</span>
                <span>{formatDate(r.date || r.time)}</span>
              </div>
              <div className="history-row">
                <span className="history-label">Time:</span>
                <span>{formatTime(r.date || r.time)}</span>
              </div>
              <div className="history-row">
                <span className="history-label">Guests:</span>
                <span>{r.guests || '-'}</span>
              </div>
              <div className="history-row">
                <span className="history-label">Table:</span>
                <span>{r.tableId}</span>
              </div>
              <div className="history-row">
                <span className="history-label">Status:</span>
                <span className={`history-status history-status--${getStatus(r.date || r.time).toLowerCase()}`}>{getStatus(r.date || r.time)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ReservationHistory;
