import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  contact: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 4 },
  popularity: { type: Number, min: 0, default: 0 },
  latitude: { type: Number },
  longitude: { type: Number },
  images: [String],
  approved: { type: Boolean, default: false },
  // new status field: 'pending' | 'approved' | 'rejected'
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

restaurantSchema.index({ status: 1, createdAt: -1 });
restaurantSchema.index({ name: 1, location: 1 });

export default mongoose.model('Restaurant', restaurantSchema);
