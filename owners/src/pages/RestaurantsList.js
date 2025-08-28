import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/RestaurantDetails.css';

function RestaurantsList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    authFetch('/api/owner/restaurants')
      .then(setList)
      .catch(console.error);
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      await authFetch(`/api/owner/restaurants/${id}`, { method: 'DELETE' });
      setList(l => l.filter(r => r._id !== id));
    } catch (err) { console.error(err); alert('Delete failed'); }
  }

  return (
    <div className="restaurants-list-page">
      <h2>Your Restaurants</h2>
      <Link to="/restaurant/new" className="btn-primary">Create Restaurant</Link>
      <div className="restaurants-grid">
        {list.map(r => (
          <div key={r._id} className="restaurant-card">
            {r.images && r.images.length ? (
              <img src={r.images[0]} alt="cover" className="restaurant-cover" />
            ) : null}
            <div className="restaurant-card-body">
              <h3>{r.name}</h3>
              <p className="muted">{r.location}</p>
              <p className="muted small">{r.description}</p>
              <div className="card-actions">
                <Link to={`/restaurant/${r._id}`} className="small-btn">Edit</Link>
                <button className="small-btn danger-btn" onClick={() => handleDelete(r._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantsList;
