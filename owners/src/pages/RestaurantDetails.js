import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/RestaurantDetails.css';

function RestaurantDetails() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    image: null
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  async function uploadImage(file) {
    const data = new FormData();
    data.append('image', file);
    const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    const res = await fetch(base + '/api/uploads/image', { method: 'POST', body: data });
    return res.json();
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.description || !form.location) {
      setMessage('All fields are required.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const payload = { name: form.name, description: form.description, location: form.location };
      if (form.image && form.image instanceof File) {
        const upl = await uploadImage(form.image);
        const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        payload.images = [ (upl.path && upl.path.startsWith('/')) ? base + upl.path : upl.path || '' ];
      }
      await authFetch('/api/owner/restaurants', { method: 'POST', body: JSON.stringify(payload) });
      setMessage('Saved to database. Redirecting...');
      navigate('/restaurants');
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="restaurant-details-page">
      <h2>Create Restaurant</h2>
      <form className="details-form" onSubmit={handleSubmit}>
        <label>Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>Description
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label>Location
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>
        <label>Image
          <input name="image" type="file" accept="image/*" onChange={handleChange} />
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        {message && <div className="form-message">{message}</div>}
      </form>
    </div>
  );
}

export default RestaurantDetails;
