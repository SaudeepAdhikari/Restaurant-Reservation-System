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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Offer', offerSchema);
