import React, { useState } from 'react';
import './MyRestaurant.css';

const initialState = {
  name: '',
  location: '',
  description: '',
  cuisine: '',
  hours: '',
  contact: '',
};

function MyRestaurant({ initial = initialState, onSave }) {
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(!initial.name);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setForm(initial);
    setEditing(false);
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSave && onSave(form);
    setEditing(false);
  };

  return (
    <div className="my-restaurant-wrapper">
      <h2>My Restaurant</h2>
      {editing ? (
        <form className="restaurant-form" onSubmit={handleSubmit}>
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
              <input name="hours" value={form.hours} onChange={handleChange} />
            </label>
          </div>
          <div className="form-row">
            <label>Contact Info
              <input name="contact" value={form.contact} onChange={handleChange} />
            </label>
          </div>
          <div className="form-actions">
            <button className="save-btn" type="submit">Save</button>
            <button className="cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="restaurant-details">
          <div><strong>Name:</strong> {form.name}</div>
          <div><strong>Location:</strong> {form.location}</div>
          <div><strong>Description:</strong> {form.description}</div>
          <div><strong>Cuisine:</strong> {form.cuisine}</div>
          <div><strong>Opening Hours:</strong> {form.hours}</div>
          <div><strong>Contact Info:</strong> {form.contact}</div>
          <button className="edit-btn" onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
}

export default MyRestaurant;
