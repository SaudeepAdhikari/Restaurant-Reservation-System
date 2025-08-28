import express from 'express';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import Customer from '../models/Customer.js';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', verifyToken, adminOnly, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ approved: true });
    res.json({ totalBookings, totalRestaurants, totalCustomers, activeRestaurants });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
