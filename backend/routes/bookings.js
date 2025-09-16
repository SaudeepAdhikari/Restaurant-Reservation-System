import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import { verifyToken } from '../middleware/authMiddleware.js';

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

    // compute start and end Date objects (treat date + time as local datetime)
    const start = new Date(`${date}T${time}`);
    // 90 minute slot
    const end = new Date(start.getTime() + 90 * 60 * 1000);

    // Use a MongoDB transaction when a tableId is provided so we atomically create booking and update table
    if (tableId) {
      const Table = (await import('../models/Table.js')).default;
      const session = await mongoose.startSession();
      try {
        let populated = null;
        await session.withTransaction(async () => {
          // ensure table exists and belongs to the restaurant
          const tableDoc = await Table.findOne({ _id: tableId, restaurantId }).session(session);
          if (!tableDoc) throw { status: 404, message: 'Table not found' };

          // Check overlap: any existing booking where start < end && end > start
          const overlap = await Table.findOne({ _id: tableId, restaurantId, bookings: { $elemMatch: { start: { $lt: end }, end: { $gt: start } } } }).session(session);
          if (overlap) throw { status: 409, message: 'Table is already booked for that time' };

          // Create booking inside transaction
          const bookingData = {
            restaurantId,
            ownerId: rest.ownerId,
            customerId,
            date,
            time,
            guests: guests || 1,
            table: tableId,
            status: 'confirmed'
          };
          const booking = await Booking.create([bookingData], { session });

          // push booking timeslot into table.bookings
          await Table.findByIdAndUpdate(tableId, { $push: { bookings: { bookingId: booking[0]._id, start, end } } }, { session });

          populated = await Booking.findById(booking[0]._id).populate('restaurantId').populate('customerId').session(session);
        });
        // after successful transaction the populated var should be set
        // however we can't access populated outside the withTransaction callback easily; re-query
        const lastBooking = await Booking.findOne({ restaurantId, customerId, date, time, table: tableId }).sort({ createdAt: -1 }).populate('restaurantId').populate('customerId');
        return res.json({ success: true, booking: lastBooking });
      } catch (err) {
        // expected errors with status
        if (err && err.status) return res.status(err.status).json({ message: err.message });
        console.error('Failed to create booking transaction', err);
        return res.status(500).json({ message: 'Server error' });
      } finally {
        session.endSession();
      }
    }

    // No table specified: simple create
    const booking = await Booking.create({
      restaurantId,
      ownerId: rest.ownerId,
      customerId,
      date,
      time,
      guests: guests || 1,
      table: tableId || null,
      status: 'confirmed'
    });
    const populated = await Booking.findById(booking._id).populate('restaurantId').populate('customerId');
    res.json({ success: true, booking: populated });
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
    const list = await Booking.find({ customerId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('Failed to list bookings', err);
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
