import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Utensils, 
  Eye, 
  TrendingUp, 
  ArrowRight,
  Plus,
  BookOpen,
  Tag,
  Settings
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { authFetch } from '../utils/auth';
import '../styles/Dashboard.css';

const chartData = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 600 },
  { name: 'Thu', revenue: 800 },
  { name: 'Fri', revenue: 500 },
  { name: 'Sat', revenue: 900 },
  { name: 'Sun', revenue: 1100 },
];

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, restaurants: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState('Owner');
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await authFetch('/api/auth/me');
        if (profile) setOwnerName(profile.name);
        const statsData = await authFetch('/api/owner/dashboard/stats');
        setStats(statsData);
        const activityData = await authFetch('/api/owner/dashboard/activity');
        setActivity(activityData);
      } catch (error) {
        console.error('Dashboard data error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-skeleton-wrapper">
        <div className="skeleton-row" />
        <div className="skeleton-grid" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Bookings', value: stats.bookings, icon: <Users size={24} />, color: 'var(--p-600)', trend: '+12.5%' },
    { label: 'Est. Revenue', value: `$${stats.revenue}`, icon: <DollarSign size={24} />, color: 'var(--success)', trend: '+8.2%' },
    { label: 'Active Restaurants', value: stats.restaurants, icon: <Utensils size={24} />, color: 'var(--s-600)', trend: '0%' },
    { label: 'Page Views', value: stats.views, icon: <Eye size={24} />, color: 'var(--warning)', trend: '-3.1%' },
  ];

  return (
    <div className="dashboard-modern-root">
      <div className="dashboard-top-section">
        <div className="welcome-area">
          <h1 className="main-title">Good morning, {ownerName.split(' ')[0]}!</h1>
          <p className="subtitle">Here's what's happening across your restaurants today.</p>
        </div>
        <div className="date-filter">
          <span>Last 7 Days</span>
          <TrendingUp size={16} />
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="kpi-card-premium"
          >
            <div className="kpi-icon-box" style={{ color: kpi.color, background: `${kpi.color}15` }}>
              {kpi.icon}
            </div>
            <div className="kpi-data">
              <span className="kpi-label">{kpi.label}</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{kpi.value}</span>
                <span className={`kpi-trend ${kpi.trend.startsWith('+') ? 'up' : 'down'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-charts-row">
        <div className="chart-card-full">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <div className="chart-legend">
              <div className="legend-item"><span className="dot primary" /> Revenue</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--n-100)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-lower-grid">
        <div className="activity-section">
          <div className="section-title-row">
            <h3>Recent Activity</h3>
            <button className="view-all-btn" onClick={() => navigate('/bookings')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="activity-feed-modern">
            {activity.length === 0 ? (
              <div className="empty-activity">No recent activity to show.</div>
            ) : (
              activity.map((item, index) => (
                <div className="activity-row-modern" key={index}>
                  <div className="type-indicator">
                    {item.type === 'booking' ? <Users size={16} /> : <BookOpen size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{item.details.customerId?.name || 'Guest'}</strong> 
                      {item.type === 'booking' ? ' made a reservation at ' : ' added new item to '}
                      <strong>{item.details.restaurantId?.name}</strong>
                    </p>
                    <span className="timestamp">{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-modern-grid">
            {[
              { label: 'Add Restaurant', icon: <Plus />, path: '/restaurant/new' },
              { label: 'Add Menu Item', icon: <BookOpen />, path: '/menu/new' },
              { label: 'Create Offer', icon: <Tag />, path: '/offers' },
              { label: 'System Settings', icon: <Settings />, path: '/profile' },
            ].map(action => (
              <button 
                key={action.label} 
                className="action-tile"
                onClick={() => navigate(action.path)}
              >
                <div className="action-tile-icon">{action.icon}</div>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


