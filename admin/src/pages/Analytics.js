import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { authFetch } from '../utils/auth';

function Analytics() {
  const [statusData, setStatusData] = useState([
    { name: 'Confirmed', value: 0, color: '#10b981' },
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Cancelled', value: 0, color: '#ef4444' }
  ]);
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    peakHour: 'N/A',
    peakIndex: 0
  });
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [distribution, statData, peakData] = await Promise.all([
          authFetch('/api/admin/analytics/status-distribution'),
          authFetch('/api/admin/analytics/stats'),
          authFetch('/api/admin/analytics/peak-hours')
        ]);

        setStatusData(Array.isArray(distribution) ? distribution : statusData);
        setStats({
          revenue: statData?.revenue || 0,
          bookings: statData?.bookings || 0,
          peakHour: statData?.peakHour || 'N/A',
          peakIndex: statData?.peakIndex || 0
        });
        setPeakHours(Array.isArray(peakData?.data) ? peakData.data : []);
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

        <div className="chart-card">
          <h3 className="chart-title">Peak Hour Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-summary">
          <h3 className="chart-title">Platform Summary</h3>
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Total Revenue</span>
              <span className="summary-value">${stats.revenue.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Bookings</span>
              <span className="summary-value">{stats.bookings}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Popular Time</span>
              <span className="summary-value">{stats.peakHour}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Peak Index</span>
              <span className="summary-value">{(stats.peakIndex * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
