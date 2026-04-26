import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Load JWT secret from environment or use a consistent default for development
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error('JWT_SECRET must be set in production environment') })() 
  : 'restaurant-reservation-system-dev-secret-key');

// Set token expiration based on environment
// Set token expiration to 24 hours for all environments as requested
const TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '30d';

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
 * Generate a refresh token with longer expiry.
 * @param {Object} payload - Data to include in the token
 * @returns {String} - JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(24).toString('hex'),
    tokenType: 'refresh'
  };

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256'
  });
};

/**
 * Set secure cookie with the token
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 * @param {String} [name='token'] - Cookie name
 */
export const setTokenCookie = (res, token, name = 'token') => {
  // Parse token expiry for cookie max age
  const tokenData = jwt.decode(token);
  const expiresIn = tokenData.exp - tokenData.iat;
  
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    maxAge: expiresIn * 1000, // convert to milliseconds
    path: '/',
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction, 
  };
  
  res.cookie(name, token, cookieOptions);
  
  logger.debug(`Setting auth cookie [${name}]: maxAge=${expiresIn * 1000}, sameSite=${cookieOptions.sameSite}, secure=${cookieOptions.secure}`);
};

/**
 * Set secure cookie with refresh token.
 * @param {Object} res - Express response object
 * @param {String} token - Refresh token
 * @param {String} [name='refreshToken'] - Cookie name
 */
export const setRefreshTokenCookie = (res, token, name = 'refreshToken') => {
  const tokenData = jwt.decode(token);
  const expiresIn = tokenData.exp - tokenData.iat;

  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    maxAge: expiresIn * 1000,
    path: '/',
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
  };

  res.cookie(name, token, cookieOptions);
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
  
  // Try role-specific cookies in order of specificity
  if (!req.cookies) return null;
  
  return req.cookies.admin_token || req.cookies.owner_token || req.cookies.token || null;
};

/**
 * Extract refresh token from request.
 * @param {Object} req - Express request object
 * @returns {String|null} - Refresh token or null
 */
export const extractRefreshTokenFromRequest = (req) => {
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }

  if (req.headers.cookie) {
    const parts = req.headers.cookie.split(';').map((p) => p.trim());
    for (const p of parts) {
      if (p.startsWith('refreshToken=')) {
        return decodeURIComponent(p.split('=')[1]);
      }
    }
  }

  return null;
};

/**
 * Verify refresh token and return decoded payload.
 * @param {String} token - Refresh token
 * @returns {Object} decoded JWT payload
 */
export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.tokenType !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }
  return decoded;
};

/**
 * Clear authentication cookies.
 * @param {Object} res - Express response
 */
export const clearAuthCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    path: '/'
  };

  if (process.env.NODE_ENV !== 'production') {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
  } else {
    cookieOptions.sameSite = 'strict';
    cookieOptions.secure = true;
  }

  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
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
