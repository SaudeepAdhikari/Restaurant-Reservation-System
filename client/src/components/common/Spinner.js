import React from 'react';
import '../../styles/Spinner.css';

export default function Spinner({ size = 24 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} aria-hidden="true"></div>
  );
}
