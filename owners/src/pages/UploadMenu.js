import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';

function UploadMenu() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ restaurantId: '', name: '', description: '', price: '', image: null });
  const [preview, setPreview] = useState(null);
  const prevUrlRef = useRef(null);
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authFetch('/api/owner/restaurants').then(setRestaurants).catch(console.error);
    return () => { if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current); };
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0] || null;
      setForm(f => ({ ...f, [name]: file }));
      if (file) {
        const url = URL.createObjectURL(file);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
        setPreview(url);
      } else {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
        setPreview(null);
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function uploadImage(file) {
    const data = new FormData(); data.append('image', file);
    const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    const res = await fetch(base + '/api/uploads/image', { method: 'POST', body: data });
    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.restaurantId || !form.name) return alert('restaurant and name required');
    setLoading(true);
    try {
      const payload = { restaurantId: form.restaurantId, name: form.name, description: form.description, price: Number(form.price) };
      if (form.image instanceof File) {
        const upl = await uploadImage(form.image);
        const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        payload.image = (upl.path && upl.path.startsWith('/')) ? base + upl.path : upl.path || upl.url || '';
      } else if (typeof form.image === 'string') {
        payload.image = form.image;
      }
      await authFetch('/api/owner/menu', { method: 'POST', body: JSON.stringify(payload) });
      navigate('/menu');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{maxWidth:820,margin:'24px auto'}}>
      <div className="menu-form-card">
        <div className="card-header"><h3>Upload Menu Item</h3></div>
        <form className="card-body" onSubmit={handleSubmit}>
          <label>
            Restaurant
            <select name="restaurantId" value={form.restaurantId} onChange={handleChange} required>
              <option value="">Select restaurant</option>
              {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </label>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>

          <label>
            Price
            <input name="price" type="number" value={form.price} onChange={handleChange} required />
          </label>

          <div className="file-upload">
            <div className="preview" aria-hidden>
              {preview ? <img src={preview} alt="preview"/> : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#f3f4f6"/><path d="M12 8V16" stroke="#c7cdd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12h8" stroke="#c7cdd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div>
              <button type="button" className="upload-btn" onClick={() => fileRef.current && fileRef.current.click()}>Upload Image</button>
              <input ref={fileRef} name="image" type="file" accept="image/*" onChange={handleChange} />
              <div className="small" style={{marginTop:6,color:'var(--muted,#6b7280)'}}>PNG, JPG — recommended 800×600</div>
            </div>
          </div>

          <div style={{marginTop:8,display:'flex',gap:8}}>
            <button type="submit" className="add-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Menu Item'}</button>
            <button type="button" onClick={() => navigate('/menu')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadMenu;
