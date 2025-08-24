import React, { useState } from 'react';
import './MenuManagement.css';

const emptyItem = { name: '', price: '', category: '', description: '' };

function MenuManagement({ initialMenu = [], onSave }) {
  const [menu, setMenu] = useState(initialMenu);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [showForm, setShowForm] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAdd = () => {
    setForm(emptyItem);
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = idx => {
    setForm(menu[idx]);
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleDelete = idx => {
    const updated = menu.filter((_, i) => i !== idx);
    setMenu(updated);
    onSave && onSave(updated);
  };

  const handleSubmit = e => {
    e.preventDefault();
    let updated;
    if (editingIndex !== null) {
      updated = menu.map((item, i) => (i === editingIndex ? form : item));
    } else {
      updated = [...menu, form];
    }
    setMenu(updated);
    onSave && onSave(updated);
    setShowForm(false);
    setEditingIndex(null);
    setForm(emptyItem);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setForm(emptyItem);
  };

  return (
    <div className="menu-management-wrapper">
      <div className="menu-management-header">
        <h2>Menu Management</h2>
        <button className="add-menu-btn" onClick={handleAdd}>+ Add Item</button>
      </div>
      <table className="menu-admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.length === 0 ? (
            <tr><td colSpan="5" className="no-menu">No menu items found.</td></tr>
          ) : (
            menu.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{typeof item.price !== 'undefined' && item.price !== '' ? `$${parseFloat(item.price).toFixed(2)}` : '-'}</td>
                <td>{item.category || '-'}</td>
                <td>{item.description || '-'}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(idx)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(idx)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showForm && (
        <form className="menu-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>Price
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>Category
              <input name="category" value={form.category} onChange={handleChange} />
            </label>
          </div>
          <div className="form-row">
            <label>Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
            </label>
          </div>
          <div className="form-actions">
            <button className="save-btn" type="submit">Save</button>
            <button className="cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MenuManagement;
