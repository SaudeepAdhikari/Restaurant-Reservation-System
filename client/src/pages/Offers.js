import React from 'react';
import OffersComponent from '../components/Offers';

export default function Offers() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Exclusive Offers</h1>
        <p className="page-subtitle">Grab the best deals and discounts from top restaurants.</p>
      </div>

      <div className="page-container">
        <OffersComponent />
      </div>
    </div>
  );
}

