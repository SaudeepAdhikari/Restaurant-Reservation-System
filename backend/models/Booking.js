import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, default: 2, min: 1, max: 20 },
  table: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ ownerId: 1, createdAt: -1 });
bookingSchema.index({ restaurantId: 1, date: 1, time: 1 });

export default mongoose.model('Booking', bookingSchema);
