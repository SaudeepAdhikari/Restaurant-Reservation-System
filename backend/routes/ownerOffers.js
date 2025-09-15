import express from 'express';
import Offer from '../models/Offer.js';
import Restaurant from '../models/Restaurant.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// List offers for the logged-in owner
router.get('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const offers = await Offer.find({ ownerId }).populate('restaurantId', 'name');
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create an offer for one of the owner's restaurants
router.post('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const { restaurantId, title, description, image, startDate, endDate, promoCode, discountPercent } = req.body;
    if (!restaurantId || !title) return res.status(400).json({ message: 'restaurantId and title required' });
    // verify restaurant belongs to owner
    const rest = await Restaurant.findById(restaurantId);
    if (!rest) return res.status(404).json({ message: 'Restaurant not found' });
    if (String(rest.ownerId) !== String(ownerId)) return res.status(403).json({ message: 'Not allowed to add offer for this restaurant' });

  const offer = new Offer({ ownerId, restaurantId, title, description, image, promoCode, discountPercent, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined });
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optionally delete an offer
router.delete('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (String(offer.ownerId) !== String(ownerId)) return res.status(403).json({ message: 'Not allowed' });
    await offer.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
