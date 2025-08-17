import React from 'react';
import './ManageReservations.css';

function ManageReservations({ reservations = [], onConfirm, onCancel }) {
  return (
    <div className="manage-reservations-wrapper">
      <h2>Manage Reservations</h2>
      <table className="reservations-admin-table">
        <thead>
          <tr>
            <th>Reservation ID</th>
            <th>Customer Name</th>
            <th>Contact</th>
            <th>Table</th>
            <th>Guests</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr><td colSpan="9" className="no-reservations">No reservations found.</td></tr>
          ) : (
            reservations.map(res => {
              let date = '-';
              let time = '-';
              if (res.time) {
                const dt = new Date(res.time);
                date = dt.toLocaleDateString();
                time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
              return (
                <tr key={res.id}>
                  <td>{res.id}</td>
                  <td>{res.name}</td>
                  <td>{res.email || res.phone || '-'}</td>
                  <td>{res.tableId}</td>
                  <td>{res.guests || '-'}</td>
                  <td>{date}</td>
                  <td>{time}</td>
                  <td><span className={`reservation-status reservation-status--${res.status || 'pending'}`}>{res.status || 'Pending'}</span></td>
                  <td>
                    <button className="confirm-btn" onClick={() => onConfirm(res)} disabled={res.status === 'Confirmed'}>Confirm</button>
                    <button className="cancel-btn" onClick={() => onCancel(res)} disabled={res.status === 'Cancelled'}>Cancel</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageReservations;
