const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// For demo: admin-only login using credentials from environment variables.
// This avoids needing a users DB for a quick presentation/demo.
// Required env vars (already added to backend/.env): ADMIN_EMAIL, ADMIN_PASSWORD
// POST /api/auth/login
// body: { email, password }
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cschain.vn';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const payload = {
    email: adminEmail,
    role: 'admin',
    name: process.env.ADMIN_NAME || 'Administrator',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  return res.json({ token });
});

// Example protected route: GET /api/auth/profile
router.get('/profile', (req, res) => {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'missing_token' });
  }

  const token = parts[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return res.json({ profile: { email: data.email } });
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
});

module.exports = router;
