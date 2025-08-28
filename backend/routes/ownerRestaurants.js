import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create restaurant
router.post('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const data = { ...req.body, ownerId };
    const restaurant = await Restaurant.create(data);
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all restaurants for owner
router.get('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const list = await Restaurant.find({ ownerId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single restaurant (owner-scoped)
router.get('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const rest = await Restaurant.findOne({ _id: req.params.id, ownerId });
    if (!rest) return res.status(404).json({ message: 'Not found' });
    res.json(rest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update restaurant
router.put('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const rest = await Restaurant.findOneAndUpdate({ _id: req.params.id, ownerId }, req.body, { new: true });
    if (!rest) return res.status(404).json({ message: 'Not found' });
    res.json(rest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete restaurant
router.delete('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const rest = await Restaurant.findOneAndDelete({ _id: req.params.id, ownerId });
    if (!rest) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
