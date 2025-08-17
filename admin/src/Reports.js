import React from 'react';
import './Reports.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Reports({ stats = {}, occupancyData = {}, tableData = {} }) {
  return (
    <div className="reports-wrapper">
      <h2>Reports & Statistics</h2>
      <div className="reports-cards">
        <div className="report-card">
          <div className="report-card-title">Total Reservations Today</div>
          <div className="report-card-value">{stats.today || 0}</div>
        </div>
        <div className="report-card">
          <div className="report-card-title">Upcoming Reservations</div>
          <div className="report-card-value">{stats.upcoming || 0}</div>
        </div>
        <div className="report-card">
          <div className="report-card-title">Table Occupancy (%)</div>
          <div className="report-card-value">{stats.occupancy || 0}%</div>
        </div>
      </div>
      <div className="reports-charts">
        <div className="report-chart">
          <h4>Reservations by Table</h4>
          <Bar
            data={tableData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
            height={220}
          />
        </div>
        <div className="report-chart">
          <h4>Occupancy Distribution</h4>
          <Pie
            data={occupancyData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }}
            height={220}
          />
        </div>
      </div>
    </div>
  );
}

export default Reports;
