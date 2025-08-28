import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authFetch, apiPost } from '../utils/auth';
import '../styles/RestaurantDetails.css';

function RestaurantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', location: '', image: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      authFetch(`/api/owner/restaurants/${id}`).then(r => setForm(r)).catch(console.error);
    }
  }, [id]);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  }

  async function uploadImage(file) {
    const data = new FormData();
    data.append('image', file);
    const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/uploads/image', {
      method: 'POST', body: data
    });
    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.location) return alert('Name and location required');
    setLoading(true);
    try {
      const payload = { name: form.name, description: form.description, location: form.location };
      if (form.image && form.image instanceof File) {
        const upl = await uploadImage(form.image);
        const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        payload.images = [upl.path.startsWith('/') ? base + upl.path : upl.path];
      }
      if (id && id !== 'new') {
        await authFetch(`/api/owner/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await authFetch('/api/owner/restaurants', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/restaurants');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error');
    } finally { setLoading(false); }
  }

  return (
    <div className="restaurant-details-page">
      <h2>{id && id !== 'new' ? 'Edit' : 'Create'} Restaurant</h2>
      <form className="details-form" onSubmit={handleSubmit}>
        <label>Name
          <input name="name" value={form.name || ''} onChange={handleChange} required />
        </label>
        <label>Description
          <textarea name="description" value={form.description || ''} onChange={handleChange} />
        </label>
        <label>Location
          <input name="location" value={form.location || ''} onChange={handleChange} required />
        </label>
        <label>Image
          <input name="image" type="file" accept="image/*" onChange={handleChange} />
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
}

export default RestaurantForm;
