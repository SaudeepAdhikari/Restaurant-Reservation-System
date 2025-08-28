import React, { useState } from 'react';
import '../styles/Modal.css';

function TableModal({ table, onClose, onSave }) {
  const [form, setForm] = useState(table || { name: '', capacity: 2, available: true });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.capacity) {
      setError('Name and capacity are required.');
      return;
    }
    setError('');
    onSave({ ...form, capacity: Number(form.capacity) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{table ? 'Edit Table' : 'Add Table'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>Capacity
            <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
          </label>
          <label>
            <input name="available" type="checkbox" checked={form.available} onChange={handleChange} /> Available
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button className="btn-primary" type="submit">Save</button>
            <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableModal;
