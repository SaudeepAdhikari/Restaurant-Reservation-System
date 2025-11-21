import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import '../styles/Owners.css';

function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/owners', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setOwners(data);
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const columns = [
    { key: 'name', label: 'Owner Name' },
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
    <div className="owners-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Restaurant Owners</h1>
          <p className="page-subtitle">Manage restaurant owner accounts</p>
        </div>
      </div>

      {owners.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3>No Owners Yet</h3>
          <p>Owner accounts will appear here once they register.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={owners} />
      )}
    </div>
  );
}

export default Owners;
