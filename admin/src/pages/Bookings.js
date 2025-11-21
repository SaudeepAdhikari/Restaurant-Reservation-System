import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Bookings.css';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const columns = [
    {
      key: 'customerId',
      label: 'Customer',
      render: (row) => row.customerId?.name || 'Unknown'
    },
    {
      key: 'restaurantId',
      label: 'Restaurant',
      render: (row) => row.restaurantId?.name || 'Unknown'
    },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'guests', label: 'Guests' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`status-badge status-${row.status}`}>
          {row.status}
        </span>
      )
    }
  ];

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Monitor all restaurant reservations</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3>No Bookings Yet</h3>
          <p>Reservations will appear here once customers start booking.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={bookings} />
      )}
    </div>
  );
}

export default Bookings;
