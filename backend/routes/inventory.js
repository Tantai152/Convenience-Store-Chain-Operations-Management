const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { products } = require('../data/db');  // ← Import từ data/db.js

let nextId = products.length + 1;

// Tính status
function updateStatus(p) {
    if (p.current_stock <= 0) p.status = 'critical';
    else if (p.current_stock < p.threshold) p.status = 'low';
    else p.status = 'ok';
}

// GET /api/products
router.get('/products', authenticate, (req, res) => {
    products.forEach(p => updateStatus(p));
    res.json({ products });
});

// GET /api/products/:id
router.get('/products/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    updateStatus(product);
    res.json(product);
});

// POST /api/products
router.post('/products', authenticate, requireAdmin, (req, res) => {
    const { name, category, price, current_stock, threshold } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Thiếu tên hoặc giá' });
    
    const newProduct = {
        id: nextId++,
        name,
        category: category || 'Chưa phân loại',
        price: parseInt(price),
        current_stock: current_stock || 0,
        threshold: threshold || 10
    };
    updateStatus(newProduct);
    products.push(newProduct);
    res.status(201).json({ message: 'Thêm thành công', product: newProduct });
});

// PUT /api/products/:id
router.put('/products/:id', authenticate, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    
    const { name, category, price, threshold } = req.body;
    if (name) product.name = name;
    if (category) product.category = category;
    if (price) product.price = parseInt(price);
    if (threshold !== undefined) product.threshold = parseInt(threshold);
    updateStatus(product);
    res.json({ message: 'Cập nhật thành công', product });
});

// PUT /api/products/:id/stock (RESTOCK)
router.put('/products/:id/stock', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    
    const { quantity } = req.body;
    if (quantity === undefined || isNaN(quantity)) return res.status(400).json({ message: 'Thiếu số lượng' });
    
    product.current_stock += parseInt(quantity);
    if (product.current_stock < 0) product.current_stock = 0;
    updateStatus(product);
    res.json({ message: 'Cập nhật kho thành công', product });
});

// GET /api/inventory/alerts
router.get('/inventory/alerts', authenticate, (req, res) => {
    products.forEach(p => updateStatus(p));
    const alerts = products.filter(p => p.status === 'low' || p.status === 'critical');
    res.json({ alerts, count: alerts.length });
});

module.exports = router;