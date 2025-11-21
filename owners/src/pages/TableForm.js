import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Restaurants.css'; // Reuse form styles

function TableForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', capacity: 2, restaurantId: '' });
  const [restaurants, setRestaurants] = useState([]);
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
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.restaurantId) return alert('Name and restaurant required');
    setLoading(true);
    try {
      await authFetch('/api/owner/tables', { method: 'POST', body: JSON.stringify(form) });
      navigate('/tables');
    } catch (err) {
      console.error(err);
      alert('Error creating table');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tables-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Add New Table</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Add a table to your floor plan
          </p>
        </div>
        <button className="btn-base btn-secondary" onClick={() => navigate('/tables')}>
          Cancel
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Table Details</h3>

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
                <label className="form-label">Table Name / Number</label>
                <input
                  className="form-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Table 5 or Booth 2"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Seating Capacity</label>
                <input
                  className="form-input"
                  name="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-base btn-secondary" onClick={() => navigate('/tables')}>
              Cancel
            </button>
            <button type="submit" className="btn-base btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableForm;

