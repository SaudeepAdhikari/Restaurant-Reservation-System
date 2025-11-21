import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Restaurants.css';

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/restaurants', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/admin/restaurants/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setRestaurants(restaurants.map(r => r._id === id ? { ...r, status: 'approved', approved: true } : r));
      }
    } catch (error) {
      console.error('Error approving restaurant:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/admin/restaurants/${id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setRestaurants(restaurants.map(r => r._id === id ? { ...r, status: 'rejected', approved: false } : r));
      }
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'Restaurant Name' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`status-badge status-${row.status || (row.approved ? 'approved' : 'pending')}`}>
          {row.status || (row.approved ? 'approved' : 'pending')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          {row.status !== 'approved' && (
            <button className="btn-base btn-sm btn-primary" onClick={() => handleApprove(row._id)}>
              Approve
            </button>
          )}
          {row.status !== 'rejected' && (
            <button className="btn-base btn-sm btn-danger" onClick={() => handleReject(row._id)}>
              Reject
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="restaurants-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Restaurants</h1>
          <p className="page-subtitle">Manage and approve restaurant listings</p>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h3>No Restaurants Yet</h3>
          <p>Restaurant listings will appear here once owners register.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={restaurants} />
      )}
    </div>
  );
}

export default Restaurants;
