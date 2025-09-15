import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function verifyToken(req, res, next) {
  // Try Authorization header first
  const auth = req.headers.authorization || req.headers.Authorization;
  let token = null;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.cookie) {
    // fallback simple cookie parse if cookie-parser not present
    const parts = req.headers.cookie.split(';').map(p => p.trim());
    for (const p of parts) {
      if (p.startsWith('token=')) {
        token = decodeURIComponent(p.split('=')[1]);
        break;
      }
    }
  }
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}

export function ownerOnly(req, res, next) {
  if (!req.user || !req.user.ownerId) return res.status(403).json({ message: 'Owner access required' });
  next();
}
