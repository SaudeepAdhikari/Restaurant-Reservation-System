import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Store, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, restaurants: 0, revenue: 0, customers: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        const statsRes = await fetch(`${baseUrl}/api/admin/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        const chartRes = await fetch(`${baseUrl}/api/admin/analytics/bookings-trend`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (chartRes.ok) {
          const trendData = await chartRes.json();
          setChartData(trendData.length > 0 ? trendData : defaultChartData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setChartData(defaultChartData);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const defaultChartData = [
    { name: 'Jan', bookings: 400, revenue: 2400 },
    { name: 'Feb', bookings: 300, revenue: 1398 },
    { name: 'Mar', bookings: 200, revenue: 9800 },
    { name: 'Apr', bookings: 278, revenue: 3908 },
    { name: 'May', bookings: 189, revenue: 4800 },
    { name: 'Jun', bookings: 239, revenue: 3800 },
  ];

  if (loading) {
    return (
      <div className="admin-skeleton-loading">
        <div className="skeleton-header" />
        <div className="skeleton-grid-admin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Active Restaurants', value: stats.restaurants, icon: <Store size={22} />, trend: '+4.5%', up: true, color: 'var(--p-600)' },
    { label: 'Total Bookings', value: stats.bookings, icon: <Calendar size={22} />, trend: '+12.3%', up: true, color: 'var(--s-600)' },
    { label: 'Platform Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign size={22} />, trend: '+8.1%', up: true, color: 'var(--success)' },
    { label: 'Total Customers', value: stats.customers, icon: <Users size={22} />, trend: '-2.4%', up: false, color: 'var(--warning)' },
  ];

  return (
    <div className="admin-dashboard-root">
      <div className="admin-page-header-row">
        <div className="header-text-group">
          <h1 className="admin-main-title">Platform Intelligence</h1>
          <p className="admin-subtitle">Monitoring real-time performance across all restaurants.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-ghost-btn"><Filter size={16} /> Filters</button>
          <button className="admin-primary-btn"><Download size={16} /> Export Report</button>
        </div>
      </div>

      <div className="admin-kpi-row">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="admin-kpi-card"
          >
            <div className="kpi-top">
              <div className="kpi-icon-container" style={{ color: kpi.color, background: `${kpi.color}15` }}>
                {kpi.icon}
              </div>
              <div className={`kpi-trend-pill ${kpi.up ? 'up' : 'down'}`}>
                {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </div>
            </div>
            <div className="kpi-bottom">
              <span className="kpi-label-text">{kpi.label}</span>
              <h2 className="kpi-value-text">{kpi.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="admin-charts-section">
        <div className="admin-chart-card large">
          <div className="chart-card-header">
            <div className="title-block">
              <h3>Reservations vs Revenue</h3>
              <p>Platform growth over the last 6 months</p>
            </div>
          </div>
          <div className="chart-wrapper-admin">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorBook)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--secondary)" 
                  strokeWidth={3} 
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="chart-card-header">
            <div className="title-block">
              <h3>Monthly Bookings</h3>
            </div>
          </div>
          <div className="chart-wrapper-admin">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

