import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// List restaurants
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('ownerId', 'name email');
    res.json(restaurants);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Approve restaurant
router.put('/:id/approve', verifyToken, adminOnly, async (req, res) => {
  try {
    const r = await Restaurant.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(r);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Reject / delete restaurant
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
