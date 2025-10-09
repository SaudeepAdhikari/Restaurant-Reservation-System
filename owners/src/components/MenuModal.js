import React, { useState, useRef, useEffect } from 'react';
import '../styles/Modal.css';

function MenuModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', price: '', category: '', image: null });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(item && item.image ? item.image : null);
  const fileRef = useRef(null);
  const prevUrlRef = useRef(null);

  useEffect(() => {
    return () => { if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current); };
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    // force owners to use Upload Menu page for image selection
    if (files) return;
    setForm(f => ({ ...f, [name]: value }));
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
          <label>Image</label>
          <div className="file-upload">
            <div className="preview" aria-hidden>
              {preview ? <img src={preview} alt="preview" /> : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#f3f4f6"/><path d="M12 8V16" stroke="#c7cdd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12h8" stroke="#c7cdd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div>
              <div className="small muted">Use the Upload Menu page to attach or change images.</div>
            </div>
          </div>
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
