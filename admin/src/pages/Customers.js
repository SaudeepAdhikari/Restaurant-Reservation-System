import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { authFetch } from '../utils/auth';
import '../styles/Customers.css';

function Customers() {
  const [data, setData] = useState([]);

  useEffect(() => {
    authFetch('/api/admin/customers')
      .then(setData)
      .catch(console.error);
  }, []);

  async function handleBlock(row) {
    const id = row._id || row.id;
    try {
      const res = await authFetch(`/api/admin/customers/${id}/block`, { method: 'PUT' });
      setData(d => d.map(x => (x._id === id || x.id === id) ? res : x));
    } catch (err) { console.error(err); }
  }

  return (
    <div className="customers-page">
      <h2>Customers</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Email',key:'email'},{label:'Status',key:'blocked'}]}
        data={data}
        actions={[{label:'Block',onClick:handleBlock}]}
      />
    </div>
  );
}

export default Customers;
