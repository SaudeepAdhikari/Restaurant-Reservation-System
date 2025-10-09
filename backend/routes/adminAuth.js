import express from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { verifyToken, adminOnly, generateToken, setTokenCookie } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Register admin (for initial setup, remove or protect in production)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hash });
    const token = generateToken({ adminId: admin._id, role: 'admin' });
    setTokenCookie(res, token);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      logger.warn(`Failed login attempt for non-existent admin account: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      logger.warn(`Failed login attempt (password mismatch) for admin: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    logger.info(`Successful login for admin: ${email}`);
    const token = generateToken({ adminId: admin._id, role: 'admin' });
    setTokenCookie(res, token);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Verify token (returns 200 when token is valid and belongs to admin)
router.get('/verify', verifyToken, adminOnly, async (req, res) => {
  try {
    res.json({ ok: true, adminId: req.user.adminId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get current admin profile
router.get('/me', verifyToken, adminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.adminId).select('-password');
    if (!admin) return res.status(404).json({ message: 'Not found' });
    res.json({ id: admin._id, name: admin.name, email: admin.email, createdAt: admin.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update current admin profile
router.put('/me', verifyToken, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const { name, email, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) {
      const exists = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      update.email = email;
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      update.password = hash;
    }
    const updated = await Admin.findByIdAndUpdate(adminId, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ id: updated._id, name: updated.name, email: updated.email, createdAt: updated.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
