import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Menu.css';
import '../styles/Restaurants.css'; // Reuse form styles

function MenuForm() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    image: null,
    previewUrl: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authFetch('/api/owner/restaurants')
      .then(data => {
        setRestaurants(data);
        if (data.length > 0) {
          setForm(f => ({ ...f, restaurantId: data[0]._id }));
        }
      })
      .catch(console.error);
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setForm(f => ({
        ...f,
        image: file,
        previewUrl: URL.createObjectURL(file)
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
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
    if (!form.restaurantId || !form.name || !form.price) return alert('Restaurant, name and price are required');

    setLoading(true);
    try {
      const payload = {
        restaurantId: form.restaurantId,
        name: form.name,
        description: form.description,
        price: Number(form.price)
      };

      if (form.image instanceof File) {
        const upl = await uploadImage(form.image);
        const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        payload.image = upl.path.startsWith('/') ? base + upl.path : upl.path;
      }

      await authFetch('/api/owner/menu', { method: 'POST', body: JSON.stringify(payload) });
      navigate('/menu');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error saving menu item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="menu-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Add Menu Item</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Create a new dish for your restaurant
          </p>
        </div>
        <button className="btn-base btn-secondary" onClick={() => navigate('/menu')}>
          Cancel
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Item Details</h3>

            <div className="form-group">
              <label className="form-label">Restaurant</label>
              <select
                className="form-input"
                name="restaurantId"
                value={form.restaurantId}
                onChange={handleChange}
                required
              >
                <option value="">Select Restaurant</option>
                {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  className="form-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Classic Burger"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  className="form-input"
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the dish..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Image</h3>
            <div className="form-group">
              <label className="image-upload-preview">
                {form.previewUrl ? (
                  <img src={form.previewUrl} alt="Preview" className="preview-image" />
                ) : (
                  <div className="upload-placeholder">
                    <span style={{ fontSize: '2rem' }}>🍲</span>
                    <p>Click to upload food image</p>
                  </div>
                )}
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-base btn-secondary" onClick={() => navigate('/menu')}>
              Cancel
            </button>
            <button type="submit" className="btn-base btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuForm;

