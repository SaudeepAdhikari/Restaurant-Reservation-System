import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create menu item
router.post('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const data = { ...req.body, ownerId };
    const item = await MenuItem.create(data);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items for a restaurant (owner-scoped)
router.get('/restaurant/:restaurantId', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId, ownerId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const item = await MenuItem.findOneAndUpdate({ _id: req.params.id, ownerId }, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, ownerId });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
