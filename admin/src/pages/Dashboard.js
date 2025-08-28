import React from 'react';
import '../styles/Dashboard.css';
import { Card, CardGrid } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'Bookings', value: 1240 },
  { label: 'Active Restaurants', value: 32 },
  { label: 'Revenue', value: '$18,400' },
  { label: 'Customers', value: 540 }
];

const chartData = [
  { name: 'Jan', bookings: 120 },
  { name: 'Feb', bookings: 150 },
  { name: 'Mar', bookings: 180 },
  { name: 'Apr', bookings: 210 },
  { name: 'May', bookings: 170 },
  { name: 'Jun', bookings: 220 }
];

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>
      <CardGrid>
        {stats.map(s => (
          <Card key={s.label} title={s.label} value={s.value} />
        ))}
      </CardGrid>
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#2e86de" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
