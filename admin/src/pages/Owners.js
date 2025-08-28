import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { authFetch } from '../utils/auth';
import '../styles/Owners.css';

function Owners() {
  const [data, setData] = useState([]);

  useEffect(() => {
    authFetch('/api/admin/owners')
      .then(setData)
      .catch(console.error);
  }, []);

  async function handleDeactivate(id) {
    try {
      const res = await authFetch(`/api/admin/owners/${id}/deactivate`, { method: 'PUT' });
      setData(d => d.map(x => x._id === id ? res : x));
    } catch (err) { console.error(err); }
  }

  return (
    <div className="owners-page">
      <h2>Restaurant Owners</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Email',key:'email'},{label:'Status',key:'active'}]}
        data={data}
        actions={[{label:'Deactivate',onClick:handleDeactivate}]}
      />
    </div>
  );
}

export default Owners;
