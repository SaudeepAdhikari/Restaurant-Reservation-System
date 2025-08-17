

import AdminLayout from './AdminLayout';
import MyRestaurant from './MyRestaurant';
import MenuManagement from './MenuManagement';
import ManageTables from './ManageTables';
import ManageReservations from './ManageReservations';
import { useEffect, useState } from 'react';

function App() {
  // Hash-based navigation with state
  const [hash, setHash] = useState(window.location.hash || '#my-restaurant');

  // Simulated owner/restaurant info (replace with real auth/data as needed)
  const ownerId = 'owner1';
  const restaurantId = 'rest1';

  // Tables state (simulate with local state; replace with API calls as needed)
  const [tables, setTables] = useState([
    { id: 1, name: 'Table 1', seats: 4, status: 'available', restaurantId: 'rest1' },
    { id: 2, name: 'Table 2', seats: 2, status: 'reserved', restaurantId: 'rest1' },
    { id: 3, name: 'VIP Table', seats: 6, status: 'available', restaurantId: 'rest2' },
  ]);

  // Table handlers
  const handleAddTable = () => {
    const name = prompt('Enter table name:');
    const seats = parseInt(prompt('Enter number of seats:'), 10);
    if (!name || isNaN(seats)) return;
    const newTable = {
      id: Date.now(),
      name,
      seats,
      status: 'available',
      restaurantId,
    };
    setTables(t => [...t, newTable]);
  };

  const handleEditTable = (table) => {
    const name = prompt('Edit table name:', table.name);
    const seats = parseInt(prompt('Edit number of seats:', table.seats), 10);
    if (!name || isNaN(seats)) return;
    setTables(t => t.map(tb => tb.id === table.id ? { ...tb, name, seats } : tb));
  };

  const handleDeleteTable = (table) => {
    if (window.confirm('Delete this table?')) {
      setTables(t => t.filter(tb => tb.id !== table.id));
    }
  };


  // Reservations state (simulate with local state; replace with API calls as needed)
  const [reservations, setReservations] = useState([
    { id: 101, name: 'Alice', email: 'alice@email.com', tableId: 1, guests: 2, time: new Date().toISOString(), status: 'Pending', restaurantId: 'rest1' },
    { id: 102, name: 'Bob', phone: '555-1234', tableId: 2, guests: 4, time: new Date(Date.now() + 3600000).toISOString(), status: 'Pending', restaurantId: 'rest1' },
    { id: 103, name: 'Charlie', email: 'charlie@email.com', tableId: 3, guests: 6, time: new Date(Date.now() + 7200000).toISOString(), status: 'Confirmed', restaurantId: 'rest2' },
  ]);

  // Reservation handlers
  const handleConfirmReservation = (reservation) => {
    setReservations(rs => rs.map(r => r.id === reservation.id ? { ...r, status: 'Confirmed' } : r));
  };
  const handleCancelReservation = (reservation) => {
    setReservations(rs => rs.map(r => r.id === reservation.id ? { ...r, status: 'Cancelled' } : r));
  };

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#my-restaurant');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  let content = null;
  if (hash === '#my-restaurant') {
    content = <MyRestaurant />;
  } else if (hash === '#menu') {
    content = <MenuManagement />;
  } else if (hash === '#tables') {
    // Only show tables for this owner's restaurant
    const ownerTables = tables.filter(t => t.restaurantId === restaurantId);
    content = (
      <ManageTables
        tables={ownerTables}
        onAdd={handleAddTable}
        onEdit={handleEditTable}
        onDelete={handleDeleteTable}
      />
    );
  } else if (hash === '#reservations') {
    // Only show reservations for this owner's restaurant
    const ownerReservations = reservations.filter(r => r.restaurantId === restaurantId);
    content = (
      <ManageReservations
        reservations={ownerReservations}
        onConfirm={handleConfirmReservation}
        onCancel={handleCancelReservation}
      />
    );
  } else {
    content = <div style={{padding: '2rem'}}>Select a section from the sidebar.</div>;
  }

  return (
    <AdminLayout adminName="Owner">{content}</AdminLayout>
  );
}

export default App;
