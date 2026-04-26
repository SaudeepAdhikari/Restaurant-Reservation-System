import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getBookingWindow, pickBestTable } from '../services/tableAllocator.js';
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '../services/notificationService.js';
import { emitEvent } from '../utils/socket.js';

const router = express.Router();

// Create a booking (customer must be authenticated)
router.post('/', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ message: 'Access denied' });
    const { restaurantId, date, time, guests, tableId } = req.body;
    if (!restaurantId || !date || !time) return res.status(400).json({ message: 'restaurantId, date and time are required' });

    // optional: verify restaurant exists
    const rest = await Restaurant.findById(restaurantId);
    if (!rest) return res.status(404).json({ message: 'Restaurant not found' });

    const { start, end } = getBookingWindow(date, time);
    const session = await mongoose.startSession();

    try {
      let createdBookingId = null;

      await session.withTransaction(async () => {
        const guestsCount = Number(guests || 1);
        const restaurantTables = await Table.find({ restaurantId, available: true }).session(session).lean();

        let selectedTableId = tableId || null;

        // Intelligent table allocator when table is not explicitly selected.
        if (!selectedTableId && restaurantTables.length > 0) {
          const chosen = pickBestTable({
            tables: restaurantTables,
            peopleCount: guestsCount,
            start,
            end,
            alpha: Number(process.env.TABLE_ALLOCATOR_ALPHA || 1),
            beta: Number(process.env.TABLE_ALLOCATOR_BETA || 0.15)
          });

          if (chosen) {
            selectedTableId = chosen.table._id;
          }
        }

        if (selectedTableId) {
          const tableDoc = await Table.findOne({ _id: selectedTableId, restaurantId }).session(session);
          if (!tableDoc) throw { status: 404, message: 'Table not found' };

          const overlap = await Table.findOne({
            _id: selectedTableId,
            restaurantId,
            bookings: { $elemMatch: { start: { $lt: end }, end: { $gt: start } } }
          }).session(session);

          if (overlap) {
            throw { status: 409, message: 'Selected table is already booked for that time' };
          }
        } else if (restaurantTables.length > 0) {
          throw { status: 409, message: 'No suitable table available for the selected slot' };
        }

        const bookingData = {
          restaurantId,
          ownerId: rest.ownerId,
          customerId,
          date,
          time,
          guests: Number(guests || 1),
          table: selectedTableId ? String(selectedTableId) : null,
          status: 'pending' // Default to pending for owner approval
        };

        const booking = await Booking.create([bookingData], { session });
        createdBookingId = booking[0]._id;

        if (selectedTableId) {
          await Table.findByIdAndUpdate(
            selectedTableId,
            { $push: { bookings: { bookingId: createdBookingId, start, end } } },
            { session }
          );
        }
      });

      const populated = await Booking.findById(createdBookingId)
        .populate('restaurantId')
        .populate('customerId');

      // Do NOT send confirmation email here. It will be sent when owner accepts.
      
      emitEvent('booking:new_request', { booking: populated, restaurantId, ownerId: String(rest.ownerId) }, `owner:${String(rest.ownerId)}`);
      emitEvent('booking:created', { booking: populated, restaurantId, ownerId: String(rest.ownerId) }, 'admins');
      emitEvent('booking:created', { booking: populated, restaurantId, ownerId: String(rest.ownerId) }, `restaurant:${String(restaurantId)}`);

      return res.json({ success: true, booking: populated });
    } catch (err) {
      if (err && err.status) return res.status(err.status).json({ message: err.message });
      console.error('Failed to create booking transaction', err);
      return res.status(500).json({ message: 'Server error' });
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error('Failed to create booking', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List bookings for current customer
router.get('/customer', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ message: 'Access denied' });
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      Booking.find({ customerId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments({ customerId })
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
    console.error('Failed to list bookings', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking by customer
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ message: 'Access denied' });

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, customerId },
      { status: 'cancelled' },
      { new: true }
    ).populate('restaurantId customerId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.table) {
      const { start, end } = getBookingWindow(booking.date, booking.time);
      await Table.updateOne(
        { _id: booking.table, restaurantId: booking.restaurantId?._id },
        { $pull: { bookings: { start: { $gte: start }, end: { $lte: end } } } }
      );
    }

    sendBookingCancellationEmail({
      email: booking.customerId?.email,
      name: booking.customerId?.name,
      restaurantName: booking.restaurantId?.name || 'Restaurant',
      date: booking.date,
      time: booking.time
    }).catch(() => null);

    emitEvent('booking:updated', { booking, ownerId: String(booking.ownerId) }, `owner:${String(booking.ownerId)}`);
    emitEvent('booking:updated', { booking, ownerId: String(booking.ownerId) }, 'admins');

    res.json(booking);
  } catch (err) {
    console.error('Failed to cancel booking', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by id (customer or owner/admin can view) - allow public read for confirmation tokenless flow or require auth as needed
router.get('/:id', async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id).populate('restaurantId customerId');
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    res.json(b);
  } catch (err) {
    console.error('Failed to fetch booking', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
