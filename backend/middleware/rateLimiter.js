import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

// Create a limiter for general API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    // Log only that rate limit was exceeded without showing the IP address
    logger.warn(`Rate limit exceeded - path: ${req.method} ${req.path}`);
    return res.status(429).json({
      message: 'Too many requests, please try again later.'
    });
  }
});

// Create a stricter limiter specifically for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Log auth rate limit without IP address
    logger.warn(`Auth rate limit exceeded - path: ${req.method} ${req.path}`);
    return res.status(429).json({
      message: 'Too many login attempts, please try again later.'
    });
  }
});

// Create an even stricter limiter for failed login attempts
export const failedLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 failed login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  handler: (req, res) => {
    logger.warn(`Failed login limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({
      message: 'Too many failed login attempts, please try again after 1 hour or reset your password.'
    });
  }
});