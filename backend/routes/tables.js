import express from 'express';
import Table from '../models/Table.js';

const router = express.Router();

// Public: list tables for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const list = await Table.find({ restaurantId: req.params.restaurantId }).select('-ownerId');
    res.json(list);
  } catch (err) {
    console.error('Failed to fetch tables', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
