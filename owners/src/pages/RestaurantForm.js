import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Restaurants.css';

function RestaurantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    image: null,
    previewUrl: null
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      authFetch(`/api/owner/restaurants/${id}`)
        .then(r => {
          setForm({
            ...r,
            previewUrl: r.images && r.images.length ? r.images[0] : null
          });
          setFetching(false);
        })
        .catch(err => {
          console.error(err);
          setFetching(false);
        });
    }
  }, [id, isNew]);

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
    if (!form.name || !form.location) return alert('Name and location required');
    setLoading(true);
    try {
      const payload = { name: form.name, description: form.description, location: form.location };

      if (form.image && form.image instanceof File) {
        const upl = await uploadImage(form.image);
        const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        payload.images = [upl.path.startsWith('/') ? base + upl.path : upl.path];
      } else if (form.images) {
        // Keep existing images if no new one uploaded
        payload.images = form.images;
      }

      if (!isNew) {
        await authFetch(`/api/owner/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await authFetch('/api/owner/restaurants', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/restaurants');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error saving restaurant');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="restaurants-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">{isNew ? 'Add New Restaurant' : 'Edit Restaurant'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {isNew ? 'Create a new location for your business' : `Update details for ${form.name}`}
          </p>
        </div>
        <button className="btn-base btn-secondary" onClick={() => navigate('/restaurants')}>
          Cancel
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input
                  className="form-input"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  required
                  placeholder="e.g. The Burger Joint"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location / Address</label>
                <input
                  className="form-input"
                  name="location"
                  value={form.location || ''}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 123 Main St, New York"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Describe your restaurant..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Media</h3>
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <label className="image-upload-preview">
                {form.previewUrl ? (
                  <img src={form.previewUrl} alt="Preview" className="preview-image" />
                ) : (
                  <div className="upload-placeholder">
                    <span style={{ fontSize: '2rem' }}>📷</span>
                    <p>Click to upload cover image</p>
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
            <button type="button" className="btn-base btn-secondary" onClick={() => navigate('/restaurants')}>
              Cancel
            </button>
            <button type="submit" className="btn-base btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : (isNew ? 'Create Restaurant' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestaurantForm;

