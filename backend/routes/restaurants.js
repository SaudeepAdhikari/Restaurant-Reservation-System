import express from 'express';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Public: list restaurants (development: returns all)
router.get('/', async (req, res) => {
  try {
    // For now return all restaurants so newly uploaded entries are visible in the UI.
    // In production you may want to filter by { approved: true }.
    const list = await Restaurant.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single restaurant by id
router.get('/:id', async (req, res) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (err) {
    console.error('Failed to fetch restaurant by id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
