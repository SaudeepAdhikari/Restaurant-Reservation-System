

import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import MyRestaurant from './MyRestaurant';
import MenuManagement from './MenuManagement';
import ManageTables from './ManageTables';
import ManageReservations from './ManageReservations';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

function App() {
  // Hash-based navigation with state
  const [hash, setHash] = useState(window.location.hash || '#my-restaurant');

  // Simple auth state for admin panel (replace with real auth)
  const [isAuthed, setIsAuthed] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    // Restore token from localStorage
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (token && user) {
      setIsAuthed(true);
      try { setAuthUser(JSON.parse(user)); } catch (e) { setAuthUser(null); }
    }
  }, []);

  // TODO: replace with real restaurant id from auth/user context
  const restaurantId = 'rest1';

  // Tables state (simulate with local state; replace with API calls as needed)
  const [tables, setTables] = useState([]);

  // Table handlers
  // Table handlers — backed by API
  const handleAddTable = async () => {
    const name = prompt('Enter table name:');
    const seats = parseInt(prompt('Enter number of seats:'), 10);
    if (!name || isNaN(seats)) return;
    try {
      const created = await apiPost('/tables', { restaurantId, name, capacity: seats });
      setTables(t => [...t, { id: created._id, name: created.name, seats: created.capacity, status: created.status, restaurantId: created.restaurant }]);
    } catch (err) {
      alert('Failed to create table: ' + (err.message || ''));
    }
  };

  const handleEditTable = async (table) => {
    const name = prompt('Edit table name:', table.name);
    const seats = parseInt(prompt('Edit number of seats:', table.seats), 10);
    if (!name || isNaN(seats)) return;
    try {
      const updated = await apiPut(`/tables/${table.id}`, { name, capacity: seats });
      setTables(t => t.map(tb => tb.id === table.id ? { ...tb, name: updated.name, seats: updated.capacity } : tb));
    } catch (err) {
      alert('Failed to update table');
    }
  };

  const handleDeleteTable = async (table) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await apiDelete(`/tables/${table.id}`);
      setTables(t => t.filter(tb => tb.id !== table.id));
    } catch (err) {
      alert('Failed to delete table');
    }
  };


  // Reservations state (simulate with local state; replace with API calls as needed)
  const [reservations, setReservations] = useState([]);

  // Reservation handlers
  const handleConfirmReservation = async (reservation) => {
    try {
      const updated = await apiPut(`/reservations/${reservation.id}`, { status: 'Confirmed' });
      setReservations(rs => rs.map(r => r.id === reservation.id ? { ...r, status: updated.status } : r));
    } catch (err) { alert('Failed to confirm'); }
  };

  const handleCancelReservation = async (reservation) => {
    try {
      const updated = await apiPut(`/reservations/${reservation.id}`, { status: 'Cancelled' });
      setReservations(rs => rs.map(r => r.id === reservation.id ? { ...r, status: updated.status } : r));
    } catch (err) { alert('Failed to cancel'); }
  };

  // Menu state
  const [menu, setMenu] = useState([]);

  const handleSaveMenu = async (updatedMenu) => {
    try {
      // Determine deleted items by comparing server-known ids to updated list
      const existingIds = new Set(menu.map(m => m.id || m._id));
      const updatedIds = new Set((updatedMenu || []).map(m => m.id || m._id).filter(Boolean));
      // Deleted = in existing but not in updated
      for (const id of existingIds) {
        if (!updatedIds.has(id)) {
          try { await apiDelete(`/menu/${id}`); } catch (e) { console.warn('Failed to delete', id, e); }
        }
      }

      // Create or update remaining items
      for (const it of updatedMenu) {
        if (!it.id && !it._id) {
          await apiPost('/menu', { restaurantId, name: it.name, price: parseFloat(it.price) || 0, category: it.category, description: it.description });
        } else {
          await apiPut(`/menu/${it.id || it._id}`, { name: it.name, price: parseFloat(it.price) || 0, category: it.category, description: it.description });
        }
      }

      // Refresh menu from server
      const fresh = await apiGet('/menu');
      setMenu(fresh.map(i => ({ id: i._id, name: i.name, price: i.price, category: i.category, description: i.description })));
    } catch (err) {
      alert('Failed to save menu');
    }
  };

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#my-restaurant');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Fetch data from API on mount
  useEffect(() => {
    async function load() {
      try {
        const [tbls, resv, menuItems] = await Promise.all([apiGet('/tables'), apiGet('/reservations'), apiGet('/menu')]);
        setTables(tbls.map(t => ({ id: t._id, name: t.name, seats: t.capacity, status: t.status, restaurantId: t.restaurant })));
        setReservations(resv.map(r => ({ id: r._id, name: r.user ? r.user.name : '', email: r.user ? r.user.email : '', phone: r.user ? r.user.phone : '', tableId: r.table, guests: r.guests, time: r.date ? r.date : r.time, status: r.status, restaurantId: r.restaurant })));
        setMenu(menuItems.map(i => ({ id: i._id, name: i.name, price: i.price, category: i.category, description: i.description })));
      } catch (err) {
        console.warn('Failed to load admin data', err);
      }
    }
    load();
  }, []);

  let content = null;
  if (hash === '#my-restaurant') {
    content = <MyRestaurant />;
  } else if (hash === '#menu') {
    content = <MenuManagement initialMenu={menu} onSave={handleSaveMenu} />;
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

  const handleLogin = ({ token, user }) => {
    if (token) localStorage.setItem('adminToken', token);
    if (user) localStorage.setItem('adminUser', JSON.stringify(user));
    setAuthUser(user || null);
  setIsAuthed(true);
  // Navigate back to the main admin view after successful login
  window.location.hash = '#my-restaurant';
  setHash('#my-restaurant');
  };

  // If the user navigated to the login page hash, show the full-page login form
  if (hash === '#login') {
    return (
      <div style={{ padding: '2rem', maxWidth: 480, margin: '2rem auto' }}>
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <AdminLayout
      adminName={(authUser && authUser.name) || 'Owner'}
      adminEmail={(authUser && authUser.email) || ''}
      onLogout={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); setIsAuthed(false); setAuthUser(null); window.location.hash = '#login'; setHash('#login'); }}
      isAuthed={isAuthed}
      authUser={authUser}
      onLogin={handleLogin}
    >
      {content}
    </AdminLayout>
  );
}

export default App;
