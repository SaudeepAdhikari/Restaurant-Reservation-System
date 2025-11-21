import express from 'express';
import { authenticateToken, isOwner } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Customer from '../models/Customer.js'; // Ensure Customer is imported for population

const router = express.Router();

// GET /api/owner/dashboard/stats
router.get('/stats', authenticateToken, isOwner, async (req, res) => {
    try {
        const ownerId = req.user.userId;

        // 1. Total Bookings
        const totalBookings = await Booking.countDocuments({ ownerId });

        // 2. Total Revenue (Estimated: Confirmed Bookings * $50 avg check)
        // In a real app, we'd sum up actual bill amounts.
        const confirmedBookings = await Booking.countDocuments({ ownerId, status: 'confirmed' });
        const revenue = confirmedBookings * 50;

        // 3. Active Restaurants
        const totalRestaurants = await Restaurant.countDocuments({ ownerId });

        // 4. Page Views (Mock for now, as we don't track this yet)
        // We could implement a simple counter in the future.
        const views = Math.floor(Math.random() * 100) + 50 + (totalBookings * 5);

        res.json({
            bookings: totalBookings,
            revenue,
            restaurants: totalRestaurants,
            views
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// GET /api/owner/dashboard/activity
router.get('/activity', authenticateToken, isOwner, async (req, res) => {
    try {
        const ownerId = req.user.userId;

        // Fetch recent bookings
        const recentBookings = await Booking.find({ ownerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customerId', 'name')
            .populate('restaurantId', 'name')
            .lean();

        // Fetch recent menu items
        const recentMenu = await MenuItem.find({ ownerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('restaurantId', 'name')
            .lean();

        // Combine and format
        const activities = [
            ...recentBookings.map(b => ({
                type: 'booking',
                date: b.createdAt,
                details: b,
                id: b._id
            })),
            ...recentMenu.map(m => ({
                type: 'menu',
                date: m.createdAt,
                details: m,
                id: m._id
            }))
        ];

        // Sort combined list by date desc
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Return top 10
        res.json(activities.slice(0, 10));
    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        res.status(500).json({ message: 'Server error fetching activity' });
    }
});

export default router;
