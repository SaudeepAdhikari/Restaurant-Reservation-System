import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
import customersRoutes from './routes/customers.js';
import debugAuthRoutes from './routes/debugAuth.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
// allow requests from configured origins with credentials (cookies)
// Accept a comma-separated list in CLIENT_ORIGIN, e.g. "http://localhost:3000,http://localhost:3001"
// In development allow the requesting Origin to be reflected back so credentialed
// requests from multiple local frontends (e.g. localhost:3000 and localhost:3001)
// are accepted. In production set a fixed origin or a stricter whitelist.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);
    // reflect the request origin back — dev-friendly
    return callback(null, origin);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Dev-friendly CORS fallback: reflect the request Origin and handle preflight
// This ensures requests from multiple local frontends (eg. :3000 and :3001)
// receive proper Access-Control-Allow-* headers. In production use a fixed origin whitelist.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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
// Customer auth and profile
app.use('/api/customers', customersRoutes);
// DEV debug endpoints
app.use('/api/debug', debugAuthRoutes);

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
