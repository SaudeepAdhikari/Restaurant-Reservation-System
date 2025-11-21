import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './common/ToastContext';
import Spinner from './common/Spinner';
import '../styles/BookingModal.css';
import Button from './common/Button';

function BookingModal({ tables, restaurantId }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const tableId = (t) => t._id || t.id || t.name;

  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleConfirm = async () => {
    if (!selected || !date || !time) return setError('Please select a table, date and time');
    setLoading(true);
    setError(null);
    try {
      const payload = {
        restaurantId,
        tableId: selected,
        date,
        time,
        guests
      };

      const res = await fetch(`${base}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setShow(false);
      try { localStorage.setItem('booking_refresh', String(Date.now())); } catch (e) { /* ignore */ }
      const b = data && data.booking ? data.booking : data;
      const idToUse = b && (b._id || b.booking?._id || b.bookingId);
      if (toast && toast.show) {
        const actions = [];
        if (idToUse) actions.push({ label: 'View', onAction: () => navigate(`/booking/confirmation/${idToUse}`) });
        actions.push({ label: 'History', onAction: () => navigate('/booking/history') });
        toast.show('Booking created successfully', 6000, actions);
      }
      if (idToUse) navigate(`/booking/confirmation/${idToUse}`);
      else navigate('/booking/confirmation');
    } catch (err) {
      console.error('Failed to create booking', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-modal-wrapper">
      <Button variant="primary" size="large" onClick={() => setShow(true)} className="w-full">
        Book a Table
      </Button>

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Select a Table</h3>
            <div className="table-list-modal">
              {tables.map(t => {
                const id = tableId(t);
                const available = typeof t.available === 'boolean' ? t.available : true;
                return (
                  <button
                    key={id}
                    className={`table-btn ${available ? '' : 'unavailable'} ${selected === id ? 'selected' : ''}`}
                    disabled={!available || loading}
                    onClick={() => setSelected(id)}
                  >
                    <div className="table-name">{t.name || `Table ${id}`}</div>
                    <div className="table-meta">Capacity: {t.capacity || '—'}{t.location ? ` · ${t.location}` : ''}</div>
                  </button>
                );
              })}
            </div>

            <div className="booking-fields">
              <label>
                Date
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </label>
              <label>
                Time
                <input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </label>
              <label>
                Guests
                <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(Number(e.target.value))} />
              </label>
            </div>

            {error && <div className="booking-error">{error}</div>}

            <div className="modal-actions">
              <Button variant="primary" disabled={!selected || !date || !time || loading} onClick={handleConfirm}>
                {loading ? <Spinner size={18} /> : 'Confirm Booking'}
              </Button>
              <Button variant="secondary" onClick={() => setShow(false)} disabled={loading}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingModal;

