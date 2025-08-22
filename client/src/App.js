

import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './Header';
import Hero from './Hero';
import TablesSection from './TablesSection';
import Footer from './Footer';
import SearchRestaurants from './SearchRestaurants';
import RestaurantDetails from './RestaurantDetails';
import ReservationForm from './ReservationForm';
import ReservationHistory from './ReservationHistory';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';

function App() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [restaurants] = useState([
    { id: 1, name: 'Olive Garden', location: 'New York', cuisine: 'Italian' },
    { id: 2, name: 'Sushi Zen', location: 'San Francisco', cuisine: 'Japanese' },
    { id: 3, name: 'Taco Fiesta', location: 'Austin', cuisine: 'Mexican' },
    { id: 4, name: 'Curry House', location: 'Chicago', cuisine: 'Indian' },
    { id: 5, name: 'Le Petit Paris', location: 'Los Angeles', cuisine: 'French' },
  ]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState(window.location.hash || '#home');
  const [reserveOpen, setReserveOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/tables')
      .then(res => res.json())
      .then(setTables);
    fetch('http://localhost:5000/api/reservations')
      .then(res => res.json())
      .then(setReservations);
    const onHashChange = () => setHash(window.location.hash || '#home');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Persist user to localStorage on login
  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  // Remove user from localStorage on logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.hash = '#home';
  };


  // Reservation form submit handler
  const handleReservationSubmit = async (form) => {
    setMessage('');
    // Simulate API call
    const res = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const updated = await res.json();
      setReservations([...reservations, updated]);
      setMessage('Reservation successful!');
      return { ok: true, data: updated };
    } else {
      const err = await res.json();
      const errorMsg = err.error || 'Error making reservation';
      setMessage(errorMsg);
      return { ok: false, error: errorMsg };
    }
  };

  // Scroll to reservation form when Book Now is clicked
  const handleBookNow = () => {
  // open reservation modal instead of scrolling
  setReserveOpen(true);
  };

  // When Reserve button is clicked on a table card
  const handleReserveTable = (table) => {
    setSelectedTableId(table.id);
    const formSection = document.querySelector('.reservation-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  let content = null;
  if (hash === '#search') {
    content = <SearchRestaurants />;
  } else if (hash === '#my-reservations') {
    content = <ReservationHistory reservations={reservations} />;
  } else if (hash === '#login') {
    content = <Login onLogin={handleLogin} />;
  } else if (hash === '#signup') {
    content = <Signup onSignup={() => (window.location.hash = '#login')} />;
  } else if (hash === '#profile') {
    content = <Profile user={user} />;
  } else if (hash === '#restaurant-details') {
    // Dummy data for demonstration; replace with real data as needed
    const restaurant = {
      name: 'Olive Garden',
      location: 'New York',
      description: 'A cozy Italian restaurant with a wide selection of pasta and wine.',
      hours: '11:00 AM - 10:00 PM',
    };
    const menu = [
      { id: 1, name: 'Spaghetti Carbonara', price: 14, description: 'Classic Italian pasta with pancetta and egg.' },
      { id: 2, name: 'Margherita Pizza', price: 12, description: 'Tomato, mozzarella, basil.' },
      { id: 3, name: 'Tiramisu', price: 7, description: 'Coffee-flavored Italian dessert.' },
    ];
    const availableTables = [
      { id: 1, name: 'Table 1', seats: 4, status: 'available' },
      { id: 3, name: 'Table 3', seats: 6, status: 'available' },
    ];
    const handleReserveFromDetails = (table) => {
      setSelectedTableId(table.id);
      const formSection = document.querySelector('.reservation-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    };
    content = (
      <RestaurantDetails
        restaurant={restaurant}
        menu={menu}
        tables={availableTables}
        onReserve={handleReserveFromDetails}
      />
    );
  } else {
    content = (
      <>
        <Hero onBookNow={handleBookNow} />
        <div className="container">
          <header className="header">
            <h1>Restaurant Reservation System</h1>
          </header>
          <TablesSection tables={tables} reservations={reservations} onReserve={handleReserveTable} />
          {/* reservation form is rendered in a modal opened from header */}
          <section className="reservations-section">
            <h2>Reservations</h2>
            <ul className="reservations-list">
              {reservations.map(r => (
                <li key={r.id} className="reservation-item">{r.name} reserved Table {r.tableId} at {r.time}</li>
              ))}
            </ul>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} onBookNow={() => setReserveOpen(true)} />
      {content}

      {reserveOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setReserveOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Make a Reservation</h2>
              <button aria-label="Close" className="modal-close" onClick={() => setReserveOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <ReservationForm
                restaurants={restaurants}
                tables={tables}
                selectedTableId={selectedTableId}
                onSubmit={(f) => { handleReservationSubmit(f); setReserveOpen(false); }}
              />
              {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</div>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default App;
