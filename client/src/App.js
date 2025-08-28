import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingHistory from './pages/BookingHistory';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/booking/history" element={<BookingHistory />} />
      </Routes>
    </div>
  );
}

export default App;
