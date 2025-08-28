import React, { useState } from 'react';
import '../styles/Modal.css';

function MenuModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', price: '', category: '', image: null });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError('All fields are required.');
      return;
    }
    setError('');
    onSave({ ...form, price: Number(form.price) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{item ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>Price
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
          </label>
          <label>Category
            <input name="category" value={form.category} onChange={handleChange} required />
          </label>
          <label>Image
            <input name="image" type="file" accept="image/*" onChange={handleChange} />
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

export default MenuModal;
