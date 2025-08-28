import express from 'express';
import Booking from '../models/Booking.js';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// list bookings with optional filters
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { restaurantId, ownerId, status, from, to } = req.query;
    const q = {};
    if (restaurantId) q.restaurantId = restaurantId;
    if (ownerId) q.ownerId = ownerId;
    if (status) q.status = status;
    if (from || to) q.date = {};
    if (from) q.date.$gte = from;
    if (to) q.date.$lte = to;
    const list = await Booking.find(q).populate('restaurantId customerId');
    res.json(list);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/status', verifyToken, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const b = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(b);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
