import express from 'express';
import Booking from '../models/Booking.js';
import Table from '../models/Table.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';
import { getBookingWindow } from '../services/tableAllocator.js';
import { sendBookingCancellationEmail, sendBookingConfirmationEmail, sendBookingDeclinedEmail } from '../services/notificationService.js';
import { emitEvent } from '../utils/socket.js';

const router = express.Router();

// List bookings for owner (all bookings for restaurants owned by this owner)
router.get('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      Booking.find({ ownerId }).populate('restaurantId customerId').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments({ ownerId })
    ]);

    if (req.query.paginated === 'true') {
      return res.json({
        data: list,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

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
    const { status } = req.body; // 'confirmed' or 'cancelled' (declined)
    
    const b = await Booking.findOneAndUpdate({ _id: req.params.id, ownerId }, { status }, { new: true })
      .populate('restaurantId customerId');
    if (!b) return res.status(404).json({ message: 'Booking not found' });

    // Handle table cleanup for cancelled/declined bookings
    if (status === 'cancelled' && b.table) {
      const { start, end } = getBookingWindow(b.date, b.time);
      await Table.updateOne(
        { _id: b.table },
        { $pull: { bookings: { bookingId: b._id } } }
      );
    }

    // Send appropriate emails
    if (status === 'confirmed') {
      sendBookingConfirmationEmail({
        email: b.customerId?.email,
        name: b.customerId?.name,
        restaurantName: b.restaurantId?.name || 'Restaurant',
        date: b.date,
        time: b.time,
        guests: b.guests
      }).catch(() => null);
    } else if (status === 'cancelled') {
      sendBookingDeclinedEmail({
        email: b.customerId?.email,
        name: b.customerId?.name,
        restaurantName: b.restaurantId?.name || 'Restaurant',
        date: b.date,
        time: b.time
      }).catch(() => null);
    }

    emitEvent('booking:updated', { booking: b, ownerId: String(ownerId) }, `owner:${String(ownerId)}`);
    emitEvent('booking:updated', { booking: b, ownerId: String(ownerId) }, 'admins');
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
