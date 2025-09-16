import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  capacity: { type: Number, default: 2 },
  location: { type: String },
  available: { type: Boolean, default: true },
  // bookings stores reserved times for this table
  bookings: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    start: { type: Date },
    end: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Table', tableSchema);
