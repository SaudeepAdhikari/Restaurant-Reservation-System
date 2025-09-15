import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Customer register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    const exists = await Customer.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const name = `${firstName.trim()} ${lastName.trim()}`;
    const customer = await Customer.create({ firstName, lastName, name, phone, email, password: hash });
    const token = jwt.sign({ customerId: customer._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    // set HttpOnly cookie so token is stored server-side and sent automatically by the browser
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.json({ customer: { id: customer._id, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, name: customer.name, email: customer.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Customer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
  console.log('[auth] login attempt for:', email);
    const customer = await Customer.findOne({ email });
  console.log('[auth] customer found:', !!customer);
  if (!customer) return res.status(401).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, customer.password);
  console.log('[auth] password hash present:', !!customer.password, 'match:', match);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ customerId: customer._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    // set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.json({ customer: { id: customer._id, name: customer.name, email: customer.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Logout - clear the cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out' });
});

// Get current customer profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ message: 'Access denied' });
    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) return res.status(404).json({ message: 'Not found' });
  res.json({ id: customer._id, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, name: customer.name, email: customer.email, createdAt: customer.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
