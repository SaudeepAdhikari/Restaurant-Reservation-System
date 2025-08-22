import React, { useState } from 'react';
import './ReservationForm.css';

function ReservationForm({ restaurants = [], tables = [], onSubmit, selectedTableId }) {
  const [form, setForm] = useState({
    restaurantId: '',
    tableId: selectedTableId || '',
    name: '',
    email: '',
    phone: '',
    guests: '',
    date: '',
    time: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update form state
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Reset table selection if restaurant changes
    if (name === 'restaurantId') {
      setForm(f => ({ ...f, tableId: '' }));
    }
  };

  // Mark field as touched
  const handleBlur = e => {
    setTouched(t => ({ ...t, [e.target.name]: true }));
  };

  // Validate fields
  const validate = () => {
    const newErrors = {};
    if (!form.restaurantId) newErrors.restaurantId = 'Select a restaurant.';
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Valid email required.';
    if (!form.phone.match(/^\+?\d{7,15}$/)) newErrors.phone = 'Valid phone required.';
    if (!form.guests || isNaN(form.guests) || form.guests < 1) newErrors.guests = 'Guests must be at least 1.';
    if (!form.date) newErrors.date = 'Date required.';
    if (!form.time) newErrors.time = 'Time required.';
    if (!form.tableId) newErrors.tableId = 'Select a table.';
    return newErrors;
  };

  // On submit
  const handleSubmit = e => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    setTouched({ restaurantId: true, name: true, email: true, phone: true, guests: true, date: true, time: true, tableId: true });
    if (Object.keys(validation).length === 0) {
      // prevent duplicate submits and show success animation when done
      setSubmitting(true);
      Promise.resolve(onSubmit(form)).then(result => {
        setSubmitting(false);
        if (result && result.ok) {
          setSuccess(true);
          // fade out after animation
          setTimeout(() => {
            setForm({ restaurantId: '', tableId: '', name: '', email: '', phone: '', guests: '', date: '', time: '' });
            setTouched({});
            setSuccess(false);
          }, 2200);
        }
      }).catch(() => setSubmitting(false));
    }
  };

  // Filter tables by selected restaurant
  const filteredTables = form.restaurantId ? tables.filter(t => String(t.restaurantId) === String(form.restaurantId)) : [];

  return (
    <form className="reservation-form-2" onSubmit={handleSubmit} noValidate>
      {success && (
        <div className="reserve-success">
          <div className="checkmark">✓</div>
          <div className="success-text">Reservation confirmed</div>
        </div>
      )}
      <div className="form-row">
        <label>Restaurant
          <select name="restaurantId" value={form.restaurantId} onChange={handleChange} onBlur={handleBlur} className={errors.restaurantId && touched.restaurantId ? 'invalid' : ''} required>
            <option value="">Select Restaurant</option>
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
            ))}
          </select>
        </label>
        {errors.restaurantId && touched.restaurantId && <span className="form-error">{errors.restaurantId}</span>}
      </div>
      <div className="form-row">
        <label>Name
          <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} className={errors.name && touched.name ? 'invalid' : ''} required />
        </label>
        {errors.name && touched.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-row">
        <label>Email
          <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={errors.email && touched.email ? 'invalid' : ''} required />
        </label>
        {errors.email && touched.email && <span className="form-error">{errors.email}</span>}
      </div>
      <div className="form-row">
        <label>Phone
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur} className={errors.phone && touched.phone ? 'invalid' : ''} required />
        </label>
        {errors.phone && touched.phone && <span className="form-error">{errors.phone}</span>}
      </div>
      <div className="form-row">
        <label>Number of Guests
          <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} onBlur={handleBlur} className={errors.guests && touched.guests ? 'invalid' : ''} required />
        </label>
        {errors.guests && touched.guests && <span className="form-error">{errors.guests}</span>}
      </div>
      <div className="form-row">
        <label>Date
          <input name="date" type="date" value={form.date} onChange={handleChange} onBlur={handleBlur} className={errors.date && touched.date ? 'invalid' : ''} required />
        </label>
        {errors.date && touched.date && <span className="form-error">{errors.date}</span>}
      </div>
      <div className="form-row">
        <label>Time
          <input name="time" type="time" value={form.time} onChange={handleChange} onBlur={handleBlur} className={errors.time && touched.time ? 'invalid' : ''} required />
        </label>
        {errors.time && touched.time && <span className="form-error">{errors.time}</span>}
      </div>
      <div className="form-row">
        <label>Select Table
          <select name="tableId" value={form.tableId} onChange={handleChange} onBlur={handleBlur} className={errors.tableId && touched.tableId ? 'invalid' : ''} required disabled={!form.restaurantId}>
            <option value="">{form.restaurantId ? 'Select Table' : 'Select a restaurant first'}</option>
            {filteredTables.map(t => (
              <option key={t.id} value={t.id}>Table {t.id} ({t.seats} seats)</option>
            ))}
          </select>
        </label>
        {errors.tableId && touched.tableId && <span className="form-error">{errors.tableId}</span>}
      </div>
  <button className="form-submit-btn" type="submit" disabled={submitting}>{submitting ? 'Reserving...' : 'Reserve'}</button>
    </form>
  );
}

export default ReservationForm;
