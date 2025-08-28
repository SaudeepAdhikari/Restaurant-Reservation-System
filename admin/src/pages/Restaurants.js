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

  async function handleApprove(id) {
    try {
      const res = await authFetch(`/api/admin/restaurants/${id}/approve`, { method: 'PUT' });
      setData(d => d.map(x => x._id === id ? res : x));
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete restaurant?')) return;
    try {
      await authFetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' });
      setData(d => d.filter(x => x._id !== id));
    } catch (err) { console.error(err); }
  }

  return (
    <div className="restaurants-page">
      <h2>Restaurants</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Owner',key:'ownerId'},{label:'Status',key:'approved'}]}
        data={data}
        actions={[{label:'Approve',onClick:handleApprove},{label:'Delete',onClick:handleDelete}]}
      />
    </div>
  );
}

export default Restaurants;
