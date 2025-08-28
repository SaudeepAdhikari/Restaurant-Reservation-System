import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Owners.css';

const mockOwners = [
  { id: 1, name: 'Alice', email: 'alice@email.com', status: 'Active' },
  { id: 2, name: 'Bob', email: 'bob@email.com', status: 'Pending' }
];

function Owners() {
  const [data] = useState(mockOwners);
  return (
    <div className="owners-page">
      <h2>Restaurant Owners</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Email',key:'email'},{label:'Status',key:'status'}]}
        data={data}
        actions={[{label:'Approve',onClick:()=>{}},{label:'Reject',onClick:()=>{}}]}
      />
    </div>
  );
}

export default Owners;
