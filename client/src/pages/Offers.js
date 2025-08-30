import React from 'react';
import OffersComponent from '../components/Offers';
// Navbar rendered globally in App.js

export default function Offers() {
  return (
    <div>
      <main style={{ padding: '2rem' }}>
        <h1>Offers</h1>
        <p>Browse current restaurant offers and deals.</p>
        <OffersComponent />
      </main>
    </div>
  );
}
