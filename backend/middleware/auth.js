const jwt = require('jsonwebtoken');

/**
 * authenticate middleware
 * Verifies Bearer token in Authorization header and attaches payload to req.user
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'missing_token' });
  }

  const token = parts[1];
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const data = jwt.verify(token, secret);
    req.user = data;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

/**
 * requireAdmin middleware
 * Ensure authenticated user has role === 'admin'
 */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'not_authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  return next();
}

module.exports = {
  authenticate,
  requireAdmin,
};
