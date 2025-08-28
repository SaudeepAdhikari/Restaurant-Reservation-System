import express from 'express';
import Owner from '../models/Owner.js';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// List owners
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const owners = await Owner.find().select('-password');
    res.json(owners);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Approve or set active flag - here we just allow deactivation by admin
router.put('/:id/deactivate', verifyToken, adminOnly, async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(req.params.id, { active: false }, { new: true }).select('-password');
    res.json(owner);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
