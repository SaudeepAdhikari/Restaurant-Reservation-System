import express from 'express';
import Customer from '../models/Customer.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

// Security check - throw an error if this module is imported in production
if (process.env.NODE_ENV === 'production') {
  throw new Error('SECURITY RISK: debugAuth.js should not be used in production!');
}

logger.warn('SECURITY WARNING: Debug authentication routes are enabled');

const router = express.Router();

// DEV ONLY: check whether provided password matches stored hash for email
router.post('/check', async (req, res) => {
  logger.warn('SECURITY: Debug auth check endpoint accessed');
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) return res.json({ found: false });
    const hashPresent = !!customer.password;
    const match = await bcrypt.compare(password, customer.password);
    return res.json({ found: true, hashPresent, match });
  } catch (err) {
    logger.error(`[debugAuth] error: ${err.message}`);
    res.status(500).json({ message: 'server error' });
  }
});

// DEV ONLY: create a test customer if not present
router.post('/create', async (req, res) => {
  logger.warn('SECURITY: Debug auth create customer endpoint accessed');
  try {
    const { firstName = 'Test', lastName = 'User', email, password = 'Test1234!' , phone = '' } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    const exists = await Customer.findOne({ email });
    if (exists) return res.json({ created: false, message: 'already exists' });
    const name = `${firstName.trim()} ${lastName.trim()}`;
    const hash = await bcrypt.hash(password, 10);
    const c = await Customer.create({ firstName, lastName, name, phone, email, password: hash });
    return res.json({ created: true, id: c._id, email: c.email });
  } catch (err) {
    logger.error(`[debugAuth] create error: ${err.message}`);
    res.status(500).json({ message: 'server error' });
  }
});

export default router;
