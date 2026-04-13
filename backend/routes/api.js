const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Demo data (static arrays for presentation/demo)
const stores = [
  { id: 1, name: 'CS Chain Quận 1', address: '123 Nguyễn Huệ, Q.1' },
  { id: 2, name: 'CS Chain Quận 3', address: '45 Võ Văn Tần, Q.3' },
];

const products = [
  { id: 1, name: 'Coca Cola 330ml', price: 15000 },
  { id: 2, name: 'Pepsi 330ml', price: 15000 },
  { id: 3, name: 'Nước suối Aquafina', price: 8000 },
];

// Public endpoints
router.get('/stores', (req, res) => res.json({ stores }));
router.get('/products', (req, res) => res.json({ products }));

// Protected endpoint (requires any valid token)
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only endpoint (demo)
router.get('/admin/dashboard', authenticate, requireAdmin, (req, res) => {
  // simple demo summary
  res.json({ summary: { stores: stores.length, products: products.length, users_demo: 1 } });
});

module.exports = router;
