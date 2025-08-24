import React, { useEffect, useState } from 'react';
import './MyRestaurant.css';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

const empty = {
  name: '',
  location: '',
  description: '',
  cuisine: '',
  openingHours: '',
  contactInfo: '',
};

function MyRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet('/restaurants')
      .then(data => {
        if (!mounted) return;
        setRestaurants(Array.isArray(data) ? data : []);
      })
      .catch(() => setRestaurants([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const startCreate = () => {
    setForm(empty);
    setEditing(true);
  };

  const startEdit = r => {
    setForm({
      name: r.name || '',
      location: r.location || '',
      description: r.description || '',
      cuisine: r.cuisine || '',
      openingHours: r.openingHours || r.hours || '',
      contactInfo: r.contactInfo || r.contact || '',
      _id: r._id,
    });
    setEditing(true);
  };

  const handleDelete = async r => {
    if (!r || !r._id) return;
    const ok = window.confirm('Delete this restaurant? This will remove it and all related data.');
    if (!ok) return;
    try {
      await apiDelete(`/restaurants/${r._id}`);
      setRestaurants(rs => rs.filter(x => x._id !== r._id));
    } catch (err) {
      console.error('delete restaurant', err);
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setForm(empty);
    setEditing(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      if (form._id) {
        const updated = await apiPut(`/restaurants/${form._id}`, form);
        setRestaurants(rs => rs.map(r => (r._id === updated._id ? updated : r)));
      } else {
        const created = await apiPost('/restaurants', form);
        setRestaurants(rs => [created, ...rs]);
      }
      setEditing(false);
      setForm(empty);
    } catch (err) {
      // keep it minimal: developer can add toast later
      console.error('save restaurant', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="my-restaurant-wrapper">
      <h2>My Restaurants</h2>

      <div style={{ marginBottom: 12 }}>
        <button className="save-btn" onClick={startCreate}>Create Restaurant</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : restaurants.length === 0 ? (
        <div className="no-data">No restaurants found. Use "Create Restaurant" to add one.</div>
      ) : (
        <div className="table-wrap">
          <table className="restaurant-table">
            <thead>
              <tr>
                <th>Restaurant ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Opening Hours</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(r => (
                <tr key={r._id}>
                  <td>{r._id}</td>
                  <td>{r.name}</td>
                  <td>{r.location}</td>
                  <td>{r.openingHours || r.hours || '-'}</td>
                  <td>{r.contactInfo || r.contact || '-'}</td>
                  <td>
                    <button className="edit-btn" onClick={() => startEdit(r)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <form className="restaurant-form" onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-row">
            <label>Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>Location
              <input name="location" value={form.location} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </label>
          </div>
          <div className="form-row">
            <label>Cuisine
              <input name="cuisine" value={form.cuisine} onChange={handleChange} />
            </label>
          </div>
          <div className="form-row">
            <label>Opening Hours
              <input name="openingHours" value={form.openingHours} onChange={handleChange} />
            </label>
          </div>
          <div className="form-row">
            <label>Contact Info
              <input name="contactInfo" value={form.contactInfo} onChange={handleChange} />
            </label>
          </div>
          <div className="form-actions">
            <button className="save-btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            <button className="cancel-btn" type="button" onClick={handleCancel} disabled={busy}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MyRestaurant;
