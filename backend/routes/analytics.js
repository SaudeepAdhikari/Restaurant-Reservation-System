import express from 'express';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';

const router = express.Router();

// GET /api/admin/analytics/stats - Real-time dashboard statistics
router.get('/stats', verifyToken, adminOnly, async (req, res) => {
  try {
    // Fetch real counts from database
    const [bookingsCount, restaurantsCount, customersCount, ownersCount] = await Promise.all([
      Booking.countDocuments(),
      Restaurant.countDocuments({ status: 'approved' }),
      Customer.countDocuments(),
      Owner.countDocuments()
    ]);

    // Calculate revenue (confirmed bookings * average check)
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const estimatedRevenue = confirmedBookings * 50; // $50 average per booking

    res.json({
      bookings: bookingsCount,
      restaurants: restaurantsCount,
      customers: customersCount,
      owners: ownersCount,
      revenue: estimatedRevenue
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// GET /api/admin/analytics/bookings-trend - Monthly booking trends
router.get('/bookings-trend', verifyToken, adminOnly, async (req, res) => {
  try {
    // Get bookings grouped by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookings = await Booking.find({
      createdAt: { $gte: sixMonthsAgo }
    });

    // Group by month
    const monthlyData = {};
    bookings.forEach(booking => {
      const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Convert to array format for charts
    const chartData = Object.entries(monthlyData).map(([name, bookings]) => ({
      name,
      bookings,
      revenue: bookings * 50 // Estimated revenue
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    res.status(500).json({ message: 'Server error fetching trends' });
  }
});

// GET /api/admin/analytics/status-distribution - Booking status breakdown
router.get('/status-distribution', verifyToken, adminOnly, async (req, res) => {
  try {
    const [confirmed, pending, cancelled] = await Promise.all([
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'cancelled' })
    ]);

    res.json([
      { name: 'Confirmed', value: confirmed, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' }
    ]);
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ message: 'Server error fetching distribution' });
  }
});

export default router;
