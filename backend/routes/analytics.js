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

    const hourlyAgg = await Booking.aggregate([
      {
        $match: {
          time: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          hour: {
            $toInt: {
              $arrayElemAt: [{ $split: ['$time', ':'] }, 0]
            }
          }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const peakHourBookings = hourlyAgg[0]?.count || 0;
    const peakHour = Number.isFinite(hourlyAgg[0]?._id) ? `${String(hourlyAgg[0]._id).padStart(2, '0')}:00` : null;
    const peakIndex = bookingsCount > 0 ? peakHourBookings / bookingsCount : 0;

    res.json({
      bookings: bookingsCount,
      restaurants: restaurantsCount,
      customers: customersCount,
      owners: ownersCount,
      revenue: estimatedRevenue,
      peakHour,
      peakIndex: Number(peakIndex.toFixed(4))
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

    // Group by month-year key to avoid collisions across years
    const monthlyData = {};
    bookings.forEach(booking => {
      const d = new Date(booking.createdAt);
      const month = d.toLocaleString('default', { month: 'short' });
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { name: month, bookings: 0 };
      }
      monthlyData[key].bookings += 1;
    });

    // Convert to array format for charts
    const chartData = Object.keys(monthlyData)
      .sort()
      .map((key) => ({
        name: monthlyData[key].name,
        bookings: monthlyData[key].bookings,
        revenue: monthlyData[key].bookings * 50 // Estimated revenue
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

// GET /api/admin/analytics/peak-hours - Hourly booking density and peak index
router.get('/peak-hours', verifyToken, adminOnly, async (req, res) => {
  try {
    const hourlyData = await Booking.aggregate([
      {
        $match: {
          time: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          hour: {
            $toInt: {
              $arrayElemAt: [{ $split: ['$time', ':'] }, 0]
            }
          }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalBookings = hourlyData.reduce((sum, row) => sum + row.count, 0);
    const peak = hourlyData.reduce((max, row) => (row.count > max.count ? row : max), { _id: null, count: 0 });

    const data = hourlyData.map((row) => ({
      hour: `${String(row._id).padStart(2, '0')}:00`,
      bookings: row.count,
      peakIndex: totalBookings > 0 ? Number((row.count / totalBookings).toFixed(4)) : 0
    }));

    res.json({
      data,
      totalBookings,
      peakHour: peak._id == null ? null : `${String(peak._id).padStart(2, '0')}:00`,
      peakIndex: totalBookings > 0 ? Number((peak.count / totalBookings).toFixed(4)) : 0
    });
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    res.status(500).json({ message: 'Server error fetching peak hours' });
  }
});

export default router;
