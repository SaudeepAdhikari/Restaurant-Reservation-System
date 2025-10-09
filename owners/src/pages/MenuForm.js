import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authFetch } from '../utils/auth';

function MenuForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantId: '', name: '', description: '', price: 0, image: null });
  const [restaurants, setRestaurants] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const prevUrlRef = useRef(null);

  React.useEffect(() => {
    authFetch('/api/owner/restaurants').then(setRestaurants).catch(console.error);
  }, []);

  const location = useLocation();
  // if user returns from uploader with an image path, set it
  React.useEffect(() => {
    if (location && location.state && location.state.uploadedImage) {
      setForm(f => ({ ...f, image: location.state.uploadedImage }));
      // show preview for remote image
      const path = location.state.uploadedImage;
      if (path) setPreview(path);
    }
  }, [location]);

  function handleChange(e) {
    const { name, value, files } = e.target;
    // we no longer allow choosing files here — use Upload Menu page instead
    if (files) {
      // ignore local file selection here to force using Upload Menu
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  }

  async function uploadImage(file) {
    const data = new FormData(); data.append('image', file);
    const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/uploads/image', { method: 'POST', body: data });
    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.restaurantId || !form.name) return alert('restaurant and name required');
    const payload = { restaurantId: form.restaurantId, name: form.name, description: form.description, price: Number(form.price) };
    try {
      if (form.image instanceof File) {
        const upl = await uploadImage(form.image);
        payload.image = upl.path;
      }
      await authFetch('/api/owner/menu', { method: 'POST', body: JSON.stringify(payload) });
      navigate('/menu');
    } catch (err) { console.error(err); alert('Error'); }
  }

  useEffect(() => {
    return () => {
      // cleanup object URL on unmount
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return (
    <div className="menu-form-card">
      <div className="card-header">
        <h3>Add New Menu Item</h3>
      </div>
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
              <div className="small muted" style={{marginTop:6}}>Image attachments are handled on the Upload Menu page.</div>
            </div>
          </div>

        <div style={{marginTop:8}}>
          <button type="submit" className="add-btn">Add Menu Item</button>
        </div>
      </form>
    </div>
  );
}

export default MenuForm;
