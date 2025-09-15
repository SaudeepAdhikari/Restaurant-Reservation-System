import express from 'express';
import Offer from '../models/Offer.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Public: list offers (optionally filter by restaurantId)
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const q = {};
    if (restaurantId) q.restaurantId = restaurantId;
    // Only return offers where now is before endDate if provided (optional)
  const offers = await Offer.find(q).sort({ createdAt: -1 }).populate('restaurantId', 'name images location');
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
