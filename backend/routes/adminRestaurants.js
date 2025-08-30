import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { verifyToken, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// List restaurants
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    // Backfill status for older documents that don't have it yet
    try {
      await Restaurant.updateMany({ status: { $exists: false }, approved: true }, { $set: { status: 'approved' } });
      await Restaurant.updateMany({ status: { $exists: false }, approved: { $ne: true } }, { $set: { status: 'pending' } });
    } catch (e) { console.warn('[adminRestaurants] status backfill failed', e); }

    const restaurants = await Restaurant.find().populate('ownerId', 'name email');
    // ensure status is present on every returned object
    const out = restaurants.map(r => {
      const obj = r.toObject ? r.toObject() : r;
      if (!obj.status) obj.status = obj.approved ? 'approved' : 'pending';
      return obj;
    });
    res.json(out);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Approve restaurant
router.put('/:id/approve', verifyToken, adminOnly, async (req, res) => {
  try {
  // set approved/status then re-fetch populated owner info so frontend keeps the owner name
  await Restaurant.findByIdAndUpdate(req.params.id, { approved: true, status: 'approved' }, { new: true });
  const r = await Restaurant.findById(req.params.id).populate('ownerId', 'name email');
  const ro = r.toObject ? r.toObject() : r;
  if (!ro.status) ro.status = ro.approved ? 'approved' : 'pending';
  res.json(ro);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Reject restaurant (mark as rejected)
router.put('/:id/reject', verifyToken, adminOnly, async (req, res) => {
  try {
    await Restaurant.findByIdAndUpdate(req.params.id, { approved: false, status: 'rejected' }, { new: true });
  const r = await Restaurant.findById(req.params.id).populate('ownerId', 'name email');
  const ro = r.toObject ? r.toObject() : r;
  if (!ro.status) ro.status = ro.approved ? 'approved' : 'pending';
  res.json(ro);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Delete restaurant (permanently)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
