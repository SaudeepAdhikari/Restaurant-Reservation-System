import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import '../styles/RestaurantDetails.css';

function MenuList() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authFetch('/api/owner/restaurants')
      .then(rests => {
        setRestaurants(rests);
        if (rests.length) {
          setSelected(rests[0]._id);
          return authFetch(`/api/owner/menu/restaurant/${rests[0]._id}`);
        }
        return [];
      })
      .then(setItems)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selected) return;
    authFetch(`/api/owner/menu/restaurant/${selected}`).then(setItems).catch(console.error);
  }, [selected]);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  }

  async function uploadImage(file) {
    const data = new FormData();
    data.append('image', file);
    const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    const res = await fetch(base + '/api/uploads/image', { method: 'POST', body: data });
    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return alert('Please select a restaurant');
    if (!form.name || !form.price) return alert('Name and price are required');
    setLoading(true);
    try {
      const payload = { restaurantId: selected, name: form.name, description: form.description, price: Number(form.price) };
      if (form.image instanceof File) {
        const upl = await uploadImage(form.image);
        const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        payload.image = (upl.path && upl.path.startsWith('/')) ? base + upl.path : upl.path || '';
      }
      await authFetch('/api/owner/menu', { method: 'POST', body: JSON.stringify(payload) });
      setForm({ name: '', description: '', price: '', image: null });
      const list = await authFetch(`/api/owner/menu/restaurant/${selected}`);
      setItems(list);
    } catch (err) { console.error(err); alert(err.message || 'Error adding menu'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete menu item?')) return;
    try {
      await authFetch(`/api/owner/menu/${id}`, { method: 'DELETE' });
      setItems(s => s.filter(x => x._id !== id));
    } catch (err) { console.error(err); alert('Delete failed'); }
  }

  return (
    <div>
      <h2>Your Menu Items</h2>

      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <label style={{margin:0}}>
          Restaurant
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{marginLeft:8}}>
            <option value="">-- select --</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </label>
        <div style={{marginLeft:'auto'}}>
          <small className="muted">Selected restaurant is required to add items</small>
        </div>
      </div>

      <form className="details-form" onSubmit={handleSubmit} style={{marginBottom:18}}>
        <div style={{display:'flex', gap:12}}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} />
        </div>
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="image" type="file" accept="image/*" onChange={handleChange} />
        <div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Menu Item'}</button>
        </div>
      </form>

      <div className="menu-grid">
        {items.map(i => (
          <div key={i._id} className="menu-card">
            {i.image ? <img src={i.image} alt="item" className="menu-image"/> : null}
            <div className="menu-body">
              <strong>{i.name}</strong>
              <div className="muted">${i.price}</div>
              <div className="small muted">{i.description}</div>
              <div className="card-actions">
                <button className="small-btn">Edit</button>
                <button className="small-btn danger-btn" onClick={() => handleDelete(i._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuList;
