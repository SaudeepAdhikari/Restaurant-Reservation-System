import React from 'react';
import '../styles/Analytics.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Active', value: 32 },
  { name: 'Pending', value: 8 },
  { name: 'Rejected', value: 4 }
];
const COLORS = ['#2e86de', '#00b894', '#636e72'];

function Analytics() {
  return (
    <div className="analytics-page">
      <h2>Analytics</h2>
      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Restaurant Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#2e86de">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
