import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Bookings.css';

const mockBookings = [
  { id: 1, customer: 'John Doe', restaurant: 'Green Leaf Bistro', date: '2025-08-28', time: '7:00 PM', status: 'Confirmed' },
  { id: 2, customer: 'Jane Smith', restaurant: 'Teal Table', date: '2025-08-29', time: '8:00 PM', status: 'Pending' }
];

function Bookings() {
  const [data] = useState(mockBookings);
  return (
    <div className="bookings-page">
      <h2>All Bookings</h2>
      <DataTable
        columns={[{label:'Customer',key:'customer'},{label:'Restaurant',key:'restaurant'},{label:'Date',key:'date'},{label:'Time',key:'time'},{label:'Status',key:'status'}]}
        data={data}
      />
    </div>
  );
}

export default Bookings;
