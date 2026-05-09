const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { orders, products } = require('../data/db');

// Helper to find product
function getProduct(id) { return products.find(p=>p.id===id); }

// GET /api/orders - return recent orders (limit 50)
router.get('/', authenticate, (req, res) => {
  const list = orders.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,50);
  res.json(list.map(o=>({ ...o })));
});

// POST /api/orders - create order (admin)
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items array required' });

  // check stock
  for (const it of items) {
    const p = getProduct(it.product_id);
    if (!p) return res.status(400).json({ error: `product ${it.product_id} not found` });
    if (p.current_stock < it.quantity) return res.status(400).json({ error: `insufficient stock for product ${p.name}` });
  }

  // deduct stock and create order
  let total = 0;
  const orderItems = [];
  for (const it of items) {
    const p = getProduct(it.product_id);
    p.current_stock -= it.quantity;
    orderItems.push({ product_id: p.id, name: p.name, quantity: it.quantity, price: p.price });
    total += p.price * it.quantity;
  }

  const id = orders.reduce((m,x)=>x.id>m?x.id:m,0)+1;
  const created_at = new Date().toISOString();
  const order = { id, items: orderItems, total, created_at };
  orders.push(order);
  res.status(201).json(order);
});

module.exports = router;
