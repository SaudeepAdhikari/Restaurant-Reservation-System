import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  title: { type: String, required: true },
  description: { type: String },
  promoCode: { type: String },
  discountPercent: { type: Number, min: 0, max: 100 },
  image: { type: String }, // URL or uploaded file path
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['draft', 'scheduled', 'active', 'expired'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

offerSchema.index({ restaurantId: 1, startDate: 1, endDate: 1, status: 1 });

export default mongoose.model('Offer', offerSchema);
