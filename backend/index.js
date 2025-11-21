import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

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
import ownerOffersRoutes from './routes/ownerOffers.js';
import restaurantsRoutes from './routes/restaurants.js';
import offersRoutes from './routes/offers.js';
import customersRoutes from './routes/customers.js';
import debugAuthRoutes from './routes/debugAuth.js';
import tablesRoutes from './routes/tables.js';
import bookingsRoutes from './routes/bookings.js';
import ownerBookingsRoutes from './routes/ownerBookings.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
// allow requests from configured origins with credentials (cookies)
// Accept a comma-separated list in CLIENT_ORIGIN, e.g. "http://localhost:3000,http://localhost:3001"
// In development allow the requesting Origin to be reflected back so credentialed
// requests from multiple local frontends (e.g. localhost:3000 and localhost:3001)
// are accepted. In production set a fixed origin or a stricter whitelist.
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://localhost:3002').split(',');
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);

    // In development mode, allow any origin for testing
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, origin);
    }

    // In production, check against whitelist
    if (CLIENT_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, origin);
    } else {
      return callback(null, CLIENT_ORIGINS[0]); // default to first origin
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers choke on 204
}));
app.use(express.json());
app.use(cookieParser());

// Debug middleware to log requests - only log essential information
app.use((req, res, next) => {
  // Only log the HTTP method and path without sensitive headers
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Apply rate limiting to all requests
app.use(apiLimiter);

// No need for a second CORS handler - the cors middleware above handles this

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

// Admin management routes
app.use('/api/admin/owners', adminOwnersRoutes);
app.use('/api/admin/restaurants', adminRestaurantsRoutes);
app.use('/api/admin/customers', adminCustomersRoutes);
app.use('/api/admin/bookings', adminBookingsRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

import ownerDashboardRoutes from './routes/ownerDashboard.js';

// Owner routes
app.use('/api/owner/restaurants', ownerRestaurantsRoutes);
app.use('/api/owner/menu', ownerMenuRoutes);
app.use('/api/owner/tables', ownerTablesRoutes);
app.use('/api/owner/offers', ownerOffersRoutes);
app.use('/api/owner/dashboard', ownerDashboardRoutes);

// Public restaurants
app.use('/api/restaurants', restaurantsRoutes);
// Public tables
app.use('/api/tables', tablesRoutes);
// Public offers
app.use('/api/offers', offersRoutes);
// Bookings (customer)
app.use('/api/bookings', bookingsRoutes);
// Owner bookings and table controls
app.use('/api/owner/bookings', ownerBookingsRoutes);
// Customer auth and profile
app.use('/api/customers', customersRoutes);
// DEV debug endpoints
// Only enable debug routes in development
if (process.env.NODE_ENV !== 'production') {
  // Add a warning about debug routes being enabled
  logger.warn('Debug authentication routes are enabled - these should NOT be used in production!');
  app.use('/api/debug', debugAuthRoutes);
}

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
  logger.info('MongoDB connected');
}).catch(err => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

app.get('/', (req, res) => {
  res.send('Restaurant Booking Backend API');
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on http://0.0.0.0:${PORT}`);
});
