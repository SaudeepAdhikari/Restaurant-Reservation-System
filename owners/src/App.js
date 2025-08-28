import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RestaurantDetails from './pages/RestaurantDetails';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import RestaurantsList from './pages/RestaurantsList';
import RestaurantForm from './pages/RestaurantForm';
import TablesList from './pages/TablesList';
import TableForm from './pages/TableForm';
import MenuList from './pages/MenuList';
import MenuForm from './pages/MenuForm';
import Sidebar from './components/Sidebar';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { getToken } from './utils/auth';

function App() {
  const [token, setToken] = useState(getToken());

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuth={() => setToken(getToken())} />} />
        <Route path="/signup" element={<Signup onAuth={() => setToken(getToken())} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  function handleLogout() {
    setToken(null);
  }

  return (
    <div className="owner-app-layout">
      <Sidebar onLogout={handleLogout} />
      <main className="owner-main-content">
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/restaurants" element={<RestaurantsList />} />
            <Route path="/restaurant/:id" element={<RestaurantForm />} />
            <Route path="/restaurant/new" element={<RestaurantForm />} />
            <Route path="/tables" element={<TablesList />} />
            <Route path="/tables/new" element={<TableForm />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="/menu/new" element={<MenuForm />} />
            <Route path="/restaurant" element={<RestaurantDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
