import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingHistory from './pages/BookingHistory';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import Restaurants from './pages/Restaurants';
import Navbar from './components/common/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
    const location = useLocation();
    const hideHeaderFooter = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

    return (
      <div className="app-container">
        {!hideHeaderFooter && <Navbar />}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/restaurants" element={
              <ProtectedRoute>
                <Restaurants />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/:id" element={
              <ProtectedRoute>
                <RestaurantDetail />
              </ProtectedRoute>
            } />
            <Route path="/offers" element={
              <ProtectedRoute>
                <Offers />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/booking/confirmation" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/booking/history" element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
  </div>
  {!hideHeaderFooter && <Footer />}
      </div>
    );
}

export default App;
