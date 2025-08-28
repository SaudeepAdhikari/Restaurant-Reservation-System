import React, { useState } from 'react';
import '../styles/BookingModal.css';

function BookingModal({ tables }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div className="booking-modal-wrapper">
      <button className="btn-primary" onClick={() => setShow(true)}>Book a Table</button>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Select a Time</h3>
            <div className="table-times">
              {tables.map(t => (
                <button
                  key={t.id}
                  className={`table-btn${t.available ? '' : ' unavailable'}${selected === t.id ? ' selected' : ''}`}
                  disabled={!t.available}
                  onClick={() => setSelected(t.id)}
                >
                  {t.time}
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!selected} onClick={() => setShow(false)}>
              Confirm Booking
            </button>
            <button className="btn-secondary" onClick={() => setShow(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingModal;
