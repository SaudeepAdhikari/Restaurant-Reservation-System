import express from 'express';
import Customer from '../models/Customer.js';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const list = await Customer.find().select('-password');
    res.json(list);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/block', verifyToken, adminOnly, async (req, res) => {
  try {
    const c = await Customer.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true }).select('-password');
    res.json(c);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
