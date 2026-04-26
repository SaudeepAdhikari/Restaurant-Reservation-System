import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  X, 
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useToast } from './common/ToastContext';
import Spinner from './common/Spinner';
import Button from './common/Button';
import '../styles/BookingModal.css';

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
        toast.show('Reservation confirmed!', 5000);
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

  const selectedTableData = tables.find(t => tableId(t) === selected);

  return (
    <div className="booking-modal-premium">
      <Button variant="primary" size="large" onClick={() => setShow(true)} className="reserve-trigger-btn">
        Reserve a Table
      </Button>

      <AnimatePresence>
        {show && (
          <div className="premium-modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop" 
              onClick={() => setShow(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="premium-modal-content"
            >
              <div className="modal-header-premium">
                <div className="header-info">
                  <h2>Complete Your Reservation</h2>
                  <p>Secure your spot in seconds</p>
                </div>
                <button className="close-modal-btn" onClick={() => setShow(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-scrollable">
                <section className="modal-section">
                  <div className="section-header-row">
                    <span className="section-label">1. Choose a Table</span>
                    {selectedTableData && (
                      <span className="selection-badge">
                        <CheckCircle2 size={12} />
                        {selectedTableData.name}
                      </span>
                    )}
                  </div>
                  <div className="premium-table-grid">
                    {tables.map(t => {
                      const id = tableId(t);
                      const isSelected = selected === id;
                      const available = typeof t.available === 'boolean' ? t.available : true;
                      
                      return (
                        <button
                          key={id}
                          className={`table-card-item ${isSelected ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                          onClick={() => setSelected(id)}
                          disabled={!available}
                        >
                          <div className="table-card-header">
                            <span className="table-card-name">{t.name || `Table ${id}`}</span>
                            {isSelected && <div className="active-indicator" />}
                          </div>
                          <div className="table-card-stats">
                            <div className="stat-pill">
                              <Users size={12} />
                              <span>{t.capacity}</span>
                            </div>
                            {t.location && (
                              <div className="stat-pill">
                                <Info size={12} />
                                <span>{t.location}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="modal-section">
                  <span className="section-label">2. Date & Time Details</span>
                  <div className="booking-form-grid">
                    <div className="input-group-premium">
                      <label><Calendar size={16} /> Date</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                      />
                    </div>
                    <div className="input-group-premium">
                      <label><Clock size={16} /> Preferred Time</label>
                      <input 
                        type="time" 
                        value={time} 
                        onChange={e => setTime(e.target.value)} 
                      />
                    </div>
                    <div className="input-group-premium">
                      <label><Users size={16} /> Party Size</label>
                      <div className="guests-stepper">
                        <input 
                          type="number" 
                          min={1} 
                          max={selectedTableData?.capacity || 20} 
                          value={guests} 
                          onChange={e => setGuests(Number(e.target.value))} 
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="booking-error-alert"
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              <div className="modal-footer-premium">
                <Button 
                  variant="secondary" 
                  onClick={() => setShow(false)} 
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  disabled={!selected || !date || !time || loading} 
                  onClick={handleConfirm}
                  className="confirm-booking-btn"
                >
                  {loading ? (
                    <Spinner size={18} color="white" />
                  ) : (
                    <>
                      Confirm Reservation
                      <ChevronRight size={18} />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookingModal;
