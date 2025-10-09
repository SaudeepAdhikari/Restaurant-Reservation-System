import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Load JWT secret from environment or generate a strong one if not set
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error('JWT_SECRET must be set in production environment') })() 
  : crypto.randomBytes(64).toString('hex'));

// Set token expiration based on environment
const TOKEN_EXPIRY = process.env.NODE_ENV === 'production' ? '1d' : '7d';

/**
 * Generate a JWT token with improved security
 * @param {Object} payload - Data to include in the token
 * @returns {String} - JWT token
 */
export const generateToken = (payload) => {
  // Add token metadata
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000), // issued at
    jti: crypto.randomBytes(16).toString('hex'), // unique token ID for revocation if needed
  };

  return jwt.sign(tokenPayload, JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256' // explicitly set algorithm
  });
};

/**
 * Set secure cookie with the token
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
export const setTokenCookie = (res, token) => {
  // Parse token expiry for cookie max age
  const tokenData = jwt.decode(token);
  const expiresIn = tokenData.exp - tokenData.iat;
  
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: expiresIn * 1000, // convert to milliseconds
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {String|null} - Token or null if not found
 */
export const extractTokenFromRequest = (req) => {
  // Try Authorization header first
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  } 
  
  // Try cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  // Fallback manual cookie parsing
  if (req.headers.cookie) {
    const parts = req.headers.cookie.split(';').map(p => p.trim());
    for (const p of parts) {
      if (p.startsWith('token=')) {
        return decodeURIComponent(p.split('=')[1]);
      }
    }
  }
  
  return null;
};

/**
 * Middleware to verify token
 */
export function verifyToken(req, res, next) {
  const token = extractTokenFromRequest(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Token verification failed: ${err.message}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Admin only middleware
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

/**
 * Owner only middleware
 */
export function ownerOnly(req, res, next) {
  if (!req.user || !req.user.ownerId) {
    return res.status(403).json({ message: 'Owner access required' });
  }
  next();
}
