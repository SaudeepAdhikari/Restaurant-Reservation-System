import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Load JWT secret from environment or use a consistent default for development
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error('JWT_SECRET must be set in production environment') })() 
  : 'restaurant-reservation-system-dev-secret-key');

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
  
  // Configure cookie settings for better cross-origin compatibility
  // In development, use permissive settings
  // In production, use strict settings
  const cookieOptions = {
    httpOnly: true,
    maxAge: expiresIn * 1000, // convert to milliseconds
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
  
  res.cookie('token', token, cookieOptions);
  
  // Log cookie settings for debugging
  logger.debug(`Setting auth cookie: maxAge=${expiresIn * 1000}, sameSite=${process.env.NODE_ENV === 'production' ? 'strict' : 'none'}, secure=${process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'}`);
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
    // Log the error with additional context but redact the actual token
    logger.warn(`Token verification failed: ${err.message}, path: ${req.path}, method: ${req.method}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Admin only middleware
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Unauthorized admin access attempt: ${JSON.stringify(req.user)}`);
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

/**
 * Owner only middleware
 */
export function ownerOnly(req, res, next) {
  if (!req.user || !req.user.ownerId || req.user.role !== 'owner') {
    logger.warn(`Unauthorized owner access attempt: ${JSON.stringify(req.user)}`);
    return res.status(403).json({ message: 'Owner access required' });
  }
  next();
}
