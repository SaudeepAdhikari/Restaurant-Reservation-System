import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { authFetch } from '../utils/auth';
import '../styles/Restaurants.css';

function Restaurants() {
  const [data, setData] = useState([]);

  useEffect(() => {
    authFetch('/api/admin/restaurants')
      .then(setData)
      .catch(console.error);
  }, []);

  // accept either the whole row or an id string (DataTable passes the row)
  async function handleApprove(item) {
    const id = typeof item === 'string' ? item : (item && item._id);
    if (!id) return console.error('No id provided to approve');
    try {
  await authFetch(`/api/admin/restaurants/${id}/approve`, { method: 'PUT' });
  // Re-fetch full list to ensure consistent populated shapes
  const list = await authFetch('/api/admin/restaurants');
  setData(list);
    } catch (err) { console.error(err); }
  }

  // Reject (mark as rejected)
  async function handleReject(item) {
    const id = typeof item === 'string' ? item : (item && item._id);
    if (!id) return console.error('No id provided to reject');
    if (!window.confirm('Reject this restaurant?')) return;
    try {
      await authFetch(`/api/admin/restaurants/${id}/reject`, { method: 'PUT' });
      // Re-fetch full list to keep shapes consistent
      const list = await authFetch('/api/admin/restaurants');
      setData(list);
    } catch (err) { console.error(err); }
  }

  return (
    <div className="restaurants-page">
      <h2>Restaurants</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Owner',key:'ownerId'},{label:'Status',key:'status'}]}
        data={data}
        actions={[{label:'Approve',onClick:handleApprove},{label:'Reject',onClick:handleReject}]}
      />
    </div>
  );
}

export default Restaurants;
