import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminOwnersRoutes from './routes/adminOwners.js';
import adminRestaurantsRoutes from './routes/adminRestaurants.js';
import adminCustomersRoutes from './routes/adminCustomers.js';
import adminBookingsRoutes from './routes/adminBookings.js';
import analyticsRoutes from './routes/analytics.js';
import ownerRestaurantsRoutes from './routes/ownerRestaurants.js';
import ownerMenuRoutes from './routes/ownerMenu.js';
import ownerTablesRoutes from './routes/ownerTables.js';
import uploadsRoutes from './routes/uploads.js';
import restaurantsRoutes from './routes/restaurants.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

// Admin management routes
app.use('/api/admin/owners', adminOwnersRoutes);
app.use('/api/admin/restaurants', adminRestaurantsRoutes);
app.use('/api/admin/customers', adminCustomersRoutes);
app.use('/api/admin/bookings', adminBookingsRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Owner routes
app.use('/api/owner/restaurants', ownerRestaurantsRoutes);
app.use('/api/owner/menu', ownerMenuRoutes);
app.use('/api/owner/tables', ownerTablesRoutes);

// Public restaurants
app.use('/api/restaurants', restaurantsRoutes);

// serve uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', uploadsRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('Restaurant Booking Backend API');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
