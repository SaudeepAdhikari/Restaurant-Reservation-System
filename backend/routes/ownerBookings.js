import express from 'express';
import Booking from '../models/Booking.js';
import Table from '../models/Table.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// List bookings for owner (all bookings for restaurants owned by this owner)
router.get('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const list = await Booking.find({ ownerId }).populate('restaurantId customerId').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('Failed to list owner bookings', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (owner)
router.put('/:id/status', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const { status } = req.body;
    const b = await Booking.findOneAndUpdate({ _id: req.params.id, ownerId }, { status }, { new: true });
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    res.json(b);
  } catch (err) {
    console.error('Failed to update booking status', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Owner can set table availability manually
router.put('/tables/:tableId/availability', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const { available } = req.body;
    const t = await Table.findOneAndUpdate({ _id: req.params.tableId, ownerId }, { available }, { new: true });
    if (!t) return res.status(404).json({ message: 'Table not found' });
    res.json(t);
  } catch (err) {
    console.error('Failed to update table availability', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
