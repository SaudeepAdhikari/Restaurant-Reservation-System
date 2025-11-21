import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Customers.css';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const columns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">View and manage customer accounts</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <h3>No Customers Yet</h3>
          <p>Customer accounts will appear here once they sign up.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={customers} />
      )}
    </div>
  );
}

export default Customers;
