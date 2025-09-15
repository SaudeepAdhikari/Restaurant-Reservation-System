import React from 'react';
import '../../styles/BookingModal.css';

function ConfirmModal({ show, title = 'Confirm', message = 'Are you sure?', onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="booking-modal-wrapper">
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
          <p style={{ color: '#555' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
