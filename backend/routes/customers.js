import express from 'express';
import bcrypt from 'bcryptjs';
import Customer from '../models/Customer.js';
import { verifyToken, generateToken, setTokenCookie } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { authLimiter, failedLoginLimiter } from '../middleware/rateLimiter.js';
import { validatePassword } from '../utils/passwordValidator.js';

const router = express.Router();

// Customer register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet security requirements.', 
        errors: passwordValidation.errors 
      });
    }
    
    const exists = await Customer.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const name = `${firstName.trim()} ${lastName.trim()}`;
    const customer = await Customer.create({ firstName, lastName, name, phone, email, password: hash });
    const token = generateToken({ customerId: customer._id, role: 'customer' });
    // set secure HttpOnly cookie
    setTokenCookie(res, token);
    res.json({ customer: { id: customer._id, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, name: customer.name, email: customer.email } });
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Customer login
router.post('/login', authLimiter, failedLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    // Safe logging with email masking handled by logger
    logger.info(`Login attempt for: ${email}`);
    
    const customer = await Customer.findOne({ email });
    if (!customer) {
      logger.warn(`Failed login attempt for non-existent account: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      logger.warn(`Failed login attempt (password mismatch) for: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    logger.info(`Successful login for customer: ${email}`);
    const token = generateToken({ customerId: customer._id, role: 'customer' });
    // set secure HttpOnly cookie
    setTokenCookie(res, token);
    res.json({ customer: { id: customer._id, name: customer.name, email: customer.email } });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
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
    logger.error(`Get profile error: ${err.message}`);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update current customer profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ message: 'Access denied' });
    const { firstName, lastName, phone, email, password } = req.body;
    const update = {};
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;
    if (firstName || lastName) update.name = `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();
    if (phone !== undefined) update.phone = phone;
    if (email) {
      // ensure email not used by another customer
      const exists = await Customer.findOne({ email, _id: { $ne: customerId } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      update.email = email;
    }
    if (password) {
      // Validate password strength for updates too
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: 'Password does not meet security requirements.', 
          errors: passwordValidation.errors 
        });
      }
      
      const hash = await bcrypt.hash(password, 10);
      update.password = hash;
    }
    const updated = await Customer.findByIdAndUpdate(customerId, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ id: updated._id, firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone, name: updated.name, email: updated.email, createdAt: updated.createdAt });
  } catch (err) {
    logger.error(`Update profile error: ${err.message}`);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
