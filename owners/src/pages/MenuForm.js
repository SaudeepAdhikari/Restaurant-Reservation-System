import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';

function MenuForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantId: '', name: '', description: '', price: 0, image: null });
  const [restaurants, setRestaurants] = useState([]);

  React.useEffect(() => {
    authFetch('/api/owner/restaurants').then(setRestaurants).catch(console.error);
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
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

  return (
    <div>
      <h2>Create Menu Item</h2>
      <form onSubmit={handleSubmit}>
          <label>Restaurant
            <select name="restaurantId" value={form.restaurantId} onChange={handleChange} required>
              <option value="">Select restaurant</option>
              {restaurants.map(r=> <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </label>
        <label>Name<input name="name" value={form.name} onChange={handleChange} required/></label>
        <label>Description<textarea name="description" value={form.description} onChange={handleChange}/></label>
        <label>Price<input name="price" type="number" value={form.price} onChange={handleChange} required/></label>
        <label>Image<input name="image" type="file" accept="image/*" onChange={handleChange}/></label>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default MenuForm;
