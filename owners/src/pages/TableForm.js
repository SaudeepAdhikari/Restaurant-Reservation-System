import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';

function TableForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', capacity: 2, restaurantId: '' });
  const [restaurants, setRestaurants] = useState([]);

  React.useEffect(() => {
    authFetch('/api/owner/restaurants').then(setRestaurants).catch(console.error);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.restaurantId) return alert('name and restaurant required');
    try {
      await authFetch('/api/owner/tables', { method: 'POST', body: JSON.stringify(form) });
      navigate('/tables');
    } catch (err) { console.error(err); alert('Error'); }
  }

  return (
    <div>
      <h2>Create Table</h2>
      <form onSubmit={handleSubmit}>
          <label>Name<input name="name" value={form.name} onChange={handleChange} required/></label>
          <label>Capacity<input name="capacity" type="number" value={form.capacity} onChange={handleChange} required/></label>
          <label>Restaurant
            <select name="restaurantId" value={form.restaurantId} onChange={handleChange} required>
              <option value="">Select restaurant</option>
              {restaurants.map(r=> <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </label>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default TableForm;
