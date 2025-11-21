import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function Analytics() {
  const [statusData, setStatusData] = useState([
    { name: 'Confirmed', value: 0, color: '#10b981' },
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Cancelled', value: 0, color: '#ef4444' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch((process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/admin/analytics/status-distribution', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStatusData(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }
  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Platform insights and metrics</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3 className="chart-title">Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-summary">
          <h3 className="chart-title">Platform Summary</h3>
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Total Revenue</span>
              <span className="summary-value">$18,400</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg. Booking Value</span>
              <span className="summary-value">$85</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Popular Time</span>
              <span className="summary-value">7:00 PM</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg. Party Size</span>
              <span className="summary-value">3.5 guests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
