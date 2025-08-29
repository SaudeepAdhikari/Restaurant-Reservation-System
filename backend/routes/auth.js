import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';
import { verifyToken, ownerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    const exists = await Owner.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const owner = await Owner.create({ name, email, password: hash });
    const token = jwt.sign({ ownerId: owner._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, owner: { id: owner._id, name: owner.name, email: owner.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(401).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, owner.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ ownerId: owner._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, owner: { id: owner._id, name: owner.name, email: owner.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get current owner profile
router.get('/me', verifyToken, ownerOnly, async (req, res) => {
  try {
    const owner = await Owner.findById(req.user.ownerId).select('-password');
    if (!owner) return res.status(404).json({ message: 'Not found' });
    res.json({ id: owner._id, name: owner.name, email: owner.email, createdAt: owner.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update current owner profile
router.put('/me', verifyToken, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const { name, email, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) {
      // ensure email not used by another owner
      const exists = await Owner.findOne({ email, _id: { $ne: ownerId } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      update.email = email;
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      update.password = hash;
    }
    const updated = await Owner.findByIdAndUpdate(ownerId, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ id: updated._id, name: updated.name, email: updated.email, createdAt: updated.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
