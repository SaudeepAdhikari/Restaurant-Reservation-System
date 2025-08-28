import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { authFetch } from '../utils/auth';
import '../styles/Bookings.css';

function Bookings() {
  const [data, setData] = useState([]);

  useEffect(() => {
    authFetch('/api/admin/bookings')
      .then(setData)
      .catch(console.error);
  }, []);

  async function handleUpdateStatus(row) {
    const id = row._id || row.id;
    const next = window.prompt('Enter new status (e.g., Confirmed, Cancelled, Pending):', row.status || '');
    if (!next) return;
    try {
      const res = await authFetch(`/api/admin/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: next }) });
      setData(d => d.map(x => (x._id === id || x.id === id) ? res : x));
    } catch (err) { console.error(err); }
  }

  return (
    <div className="bookings-page">
      <h2>All Bookings</h2>
      <DataTable
        columns={[{label:'Customer',key:'customer'},{label:'Restaurant',key:'restaurant'},{label:'Date',key:'date'},{label:'Time',key:'time'},{label:'Status',key:'status'}]}
        data={data}
        actions={[{label:'Update Status',onClick:handleUpdateStatus}]}
      />
    </div>
  );
}

export default Bookings;
