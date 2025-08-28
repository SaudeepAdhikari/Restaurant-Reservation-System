import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authFetch } from '../utils/auth';

function TablesList() {
  // optional restaurantId could be passed via query in a real app; here we list all owner tables
  const [list, setList] = useState([]);

  useEffect(() => {
    // for simplicity, there's no global endpoint for all tables; owners should navigate per-restaurant
    // but we can fetch via admin/listing of restaurants then tables per restaurant in a fuller flow
    authFetch('/api/owner/restaurants').then(rests => {
      Promise.all(rests.map(r => authFetch(`/api/owner/tables/restaurant/${r._id}`))).then(arr => {
        setList(arr.flat());
      }).catch(console.error);
    }).catch(console.error);
  }, []);

  return (
    <div className="tables-page">
      <h2>Your Tables</h2>
      <Link to="/tables/new" className="btn-primary">Create Table</Link>
      <div className="tables-grid">
        {list.map(t => (
          <div key={t._id} className="table-card">
            <div>
              <strong>{t.name}</strong>
              <div className="muted small">Capacity: {t.capacity}</div>
            </div>
            <div className="card-actions">
              <button className="small-btn">Edit</button>
              <button className="small-btn danger-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TablesList;
