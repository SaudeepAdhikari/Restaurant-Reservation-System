import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';
import { verifyToken, ownerOnly, generateToken, setTokenCookie } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    const exists = await Owner.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const owner = await Owner.create({ name, email, password: hash });
    const token = generateToken({ ownerId: owner._id, role: 'owner' });
    setTokenCookie(res, token);
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
    if (!owner) {
      logger.warn(`Failed login attempt for non-existent owner account: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const match = await bcrypt.compare(password, owner.password);
    if (!match) {
      logger.warn(`Failed login attempt (password mismatch) for owner: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    logger.info(`Successful login for owner: ${email}`);
    const token = generateToken({ ownerId: owner._id, role: 'owner' });
    setTokenCookie(res, token);
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
    logger.error(`Get profile error: ${err.message}`);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Debug endpoint to check cookie and auth status - with reduced logging
router.get('/debug-auth', async (req, res) => {
  try {
    logger.info('Auth check endpoint called');
    
    // Check if there's a token cookie
    const hasCookie = !!req.cookies.token;
    
    // Try to verify the token but catch any errors
    let tokenValid = false;
    let decoded = null;
    let verificationError = null;
    
    if (hasCookie) {
      try {
        const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
          ? 'missing-production-secret' 
          : 'restaurant-reservation-system-dev-secret-key');
        
        decoded = jwt.verify(req.cookies.token, secret);
        tokenValid = true;
      } catch (err) {
        verificationError = err.message;
        logger.error(`Token verification failed`);
      }
    }
    
    // Return limited auth status - don't expose sensitive information in logs
    res.json({
      hasCookie,
      tokenValid,
      verificationError,
      decodedToken: decoded ? { 
        role: decoded.role,
        exp: new Date(decoded.exp * 1000).toISOString(),
        iat: new Date(decoded.iat * 1000).toISOString(),
        expiresIn: decoded.exp - Math.floor(Date.now() / 1000),
      } : null,
      // Don't include full cookie details or request headers in the response
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
      }
    });
  } catch (err) {
    logger.error(`Auth check error`);
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
    logger.error(`Update profile error: ${err.message}`);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Logout - clear the cookie with matching settings
router.post('/logout', (req, res) => {
  // Use same cookie clearing options as setTokenCookie for consistency
  const cookieOptions = {
    httpOnly: true,
    path: '/',
  };
  
  // For development (localhost or cross-origin testing)
  if (process.env.NODE_ENV !== 'production') {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true; // Required for sameSite=none even in development
  } else {
    // For production
    cookieOptions.sameSite = 'strict';
    cookieOptions.secure = true;
  }
  
  res.clearCookie('token', cookieOptions);
  logger.info('Owner logged out');
  res.json({ message: 'Logged out' });
});

export default router;
