const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const pool = require('../db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // 1. Try Firebase Token Verification first (if initialized)
    try {
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const [rows] = await pool.query(
          'SELECT id, firstName, lastName, email, role, status, hostelAssigned FROM users WHERE email = ?',
          [decodedToken.email]
        );
        
        if (rows.length > 0) {
          req.user = rows[0];
          return next();
        }
      }
    } catch (fbError) {
      // If Firebase fails (invalid token), we fall through to local JWT check
    }

    // 2. Local JWT Verification
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, firstName, lastName, email, role, status, hostelAssigned FROM users WHERE id = ?', [payload.userId]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token user' });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
