import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    restaurants: 0,
    revenue: 0,
    customers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';

        // Fetch stats
        const statsRes = await fetch(`${baseUrl}/api/admin/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch chart data
        const chartRes = await fetch(`${baseUrl}/api/admin/analytics/bookings-trend`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (chartRes.ok) {
          const trendData = await chartRes.json();
          // Use real data if available, otherwise show placeholder
          setChartData(trendData.length > 0 ? trendData : [
            { name: 'Jan', bookings: 0, revenue: 0 },
            { name: 'Feb', bookings: 0, revenue: 0 },
            { name: 'Mar', bookings: 0, revenue: 0 },
            { name: 'Apr', bookings: 0, revenue: 0 },
            { name: 'May', bookings: 0, revenue: 0 },
            { name: 'Jun', bookings: 0, revenue: 0 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default chart data on error
        setChartData([
          { name: 'Jan', bookings: 0, revenue: 0 },
          { name: 'Feb', bookings: 0, revenue: 0 },
          { name: 'Mar', bookings: 0, revenue: 0 },
          { name: 'Apr', bookings: 0, revenue: 0 },
          { name: 'May', bookings: 0, revenue: 0 },
          { name: 'Jun', bookings: 0, revenue: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Monitor your restaurant platform performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{stats.bookings}</span>
            <span className="stat-trend trend-up">↑ 12% vs last month</span>
          </div>
          <div className="stat-icon icon-blue">📅</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Restaurants</span>
            <span className="stat-value">{stats.restaurants}</span>
            <span className="stat-trend trend-up">↑ 3 new this week</span>
          </div>
          <div className="stat-icon icon-green">🏪</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">${stats.revenue}</span>
            <span className="stat-trend trend-up">↑ 8% vs last month</span>
          </div>
          <div className="stat-icon icon-purple">💰</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{stats.customers}</span>
            <span className="stat-trend">Active users</span>
          </div>
          <div className="stat-icon icon-orange">👥</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Bookings Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <Bar dataKey="bookings" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
