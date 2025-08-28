import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Restaurants.css';

const mockRestaurants = [
  { id: 1, name: 'Green Leaf Bistro', owner: 'Alice', status: 'Active' },
  { id: 2, name: 'Teal Table', owner: 'Bob', status: 'Pending' }
];

function Restaurants() {
  const [data] = useState(mockRestaurants);
  return (
    <div className="restaurants-page">
      <h2>Restaurants</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Owner',key:'owner'},{label:'Status',key:'status'}]}
        data={data}
        actions={[{label:'Approve',onClick:()=>{}},{label:'Reject',onClick:()=>{}}]}
      />
    </div>
  );
}

export default Restaurants;
