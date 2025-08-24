

import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import AdminProfile from './AdminProfile';
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

  // Restaurants owned by the authenticated admin
  const [restaurants, setRestaurants] = useState([]);

  // Helper to pick a restaurant id for actions that need one.
  // If none exist, prompt the user to create a restaurant first.
  const pickRestaurantId = () => {
    if (!restaurants || restaurants.length === 0) {
      alert('No restaurants found. Please create a restaurant first from your profile.');
      return null;
    }
    if (restaurants.length === 1) return restaurants[0].id;
    const choices = restaurants.map((r, i) => `${i + 1}) ${r.name} (${r.id})`).join('\n');
    const sel = prompt(`Choose a restaurant by number:\n${choices}`);
    const idx = parseInt(sel, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= restaurants.length) {
      alert('Invalid selection');
      return null;
    }
    return restaurants[idx].id;
  };

  // Tables state (simulate with local state; replace with API calls as needed)
  const [tables, setTables] = useState([]);

  // Table handlers
  // Table handlers — backed by API
  const handleAddTable = async () => {
    const restaurantId = pickRestaurantId();
    if (!restaurantId) return;
    const name = prompt('Enter table name:');
    const seats = parseInt(prompt('Enter number of seats:'), 10);
    if (!name || isNaN(seats)) return;
    try {
      const created = await apiPost('/tables', { restaurantId, name, capacity: seats });
      setTables(t => [...t, { id: created._id, name: created.name, seats: created.capacity, status: created.status, restaurantId: String(created.restaurant) }]);
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
    const restaurantId = pickRestaurantId();
    if (!restaurantId) return;
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
        // Fetch core data; restaurants endpoint requires auth and should not block tables/menu loading
        const results = await Promise.allSettled([
          apiGet('/tables'),
          apiGet('/reservations'),
          apiGet('/menu'),
          apiGet('/restaurants')
        ]);

        const [tblsRes, resvRes, menuRes, restsRes] = results;

        if (tblsRes.status === 'fulfilled' && Array.isArray(tblsRes.value)) {
          setTables(tblsRes.value.map(t => ({ id: t._id, name: t.name, seats: t.capacity, status: t.status, restaurantId: String(t.restaurant) })));
        } else {
          console.warn('Failed to fetch tables', tblsRes.status === 'rejected' ? tblsRes.reason : tblsRes.value);
        }

        if (resvRes.status === 'fulfilled' && Array.isArray(resvRes.value)) {
          setReservations(resvRes.value.map(r => ({ id: r._id, name: r.user ? r.user.name : '', email: r.user ? r.user.email : '', phone: r.user ? r.user.phone : '', tableId: r.table, guests: r.guests, time: r.date ? r.date : r.time, status: r.status, restaurantId: String(r.restaurant) })));
        } else {
          console.warn('Failed to fetch reservations', resvRes.status === 'rejected' ? resvRes.reason : resvRes.value);
        }

        if (menuRes.status === 'fulfilled' && Array.isArray(menuRes.value)) {
          setMenu(menuRes.value.map(i => ({ id: i._id, name: i.name, price: i.price, category: i.category, description: i.description })));
        } else {
          console.warn('Failed to fetch menu', menuRes.status === 'rejected' ? menuRes.reason : menuRes.value);
        }

        if (restsRes.status === 'fulfilled' && Array.isArray(restsRes.value)) {
          setRestaurants(restsRes.value.map(x => ({ id: x._id, name: x.name })));
        } else {
          // It's okay if restaurants couldn't be fetched (e.g., unauthenticated); just log it
          console.warn('Failed to fetch restaurants (may require login)', restsRes.status === 'rejected' ? restsRes.reason : restsRes.value);
        }
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
    // Only show tables for this owner's restaurants
    const ownerRestaurantIds = new Set(restaurants.map(r => String(r.id)));
    const ownerTables = tables.filter(t => ownerRestaurantIds.has(String(t.restaurantId)));
    content = (
      <ManageTables
        tables={ownerTables}
        onAdd={handleAddTable}
        onEdit={handleEditTable}
        onDelete={handleDeleteTable}
      />
    );
  } else if (hash === '#reservations') {
    // Only show reservations for this owner's restaurants
    const ownerRestaurantIds = new Set(restaurants.map(r => String(r.id)));
    const ownerReservations = reservations.filter(r => ownerRestaurantIds.has(String(r.restaurantId)));
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

  if (hash === '#profile') {
  content = <AdminProfile authUser={authUser} onMenuAdded={(created) => setMenu(m => [...m, { id: created._id, name: created.name, price: created.price, category: created.category, description: created.description }])} onTableAdded={(created) => setTables(t => [...t, { id: created._id, name: created.name, seats: created.capacity, status: created.status, restaurantId: String(created.restaurant) }])} />;
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
