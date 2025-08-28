import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Customers.css';

const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@email.com', bookings: 5 },
  { id: 2, name: 'Jane Smith', email: 'jane@email.com', bookings: 3 }
];

function Customers() {
  const [data] = useState(mockCustomers);
  return (
    <div className="customers-page">
      <h2>Customers</h2>
      <DataTable
        columns={[{label:'Name',key:'name'},{label:'Email',key:'email'},{label:'Bookings',key:'bookings'}]}
        data={data}
      />
    </div>
  );
}

export default Customers;
