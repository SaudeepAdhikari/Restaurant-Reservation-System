import express from 'express';
import Table from '../models/Table.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create table
router.post('/', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const data = { ...req.body, ownerId };
    const t = await Table.create(data);
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List tables for a restaurant
router.get('/restaurant/:restaurantId', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const list = await Table.find({ restaurantId: req.params.restaurantId, ownerId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const t = await Table.findOneAndUpdate({ _id: req.params.id, ownerId }, req.body, { new: true });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const t = await Table.findOneAndDelete({ _id: req.params.id, ownerId });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
