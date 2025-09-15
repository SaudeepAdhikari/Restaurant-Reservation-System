import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  blocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Customer', customerSchema);
