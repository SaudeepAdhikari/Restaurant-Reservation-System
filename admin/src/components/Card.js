import React from 'react';
import '../styles/Card.css';

export function Card({ title, value }) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">{title}</div>
      <div className="admin-card-value">{value}</div>
    </div>
  );
}

export function CardGrid({ children }) {
  return <div className="admin-card-grid">{children}</div>;
}
