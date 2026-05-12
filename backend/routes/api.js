const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Use stores/products from the central in-memory data store
const { stores, products } = require('../data/db');
let nextStoreId = stores.length + 1;

// Helper to compute stock status similar to inventory routes
function computeStatus(p) {
    if (!p) return 'unknown';
    if ((p.current_stock || 0) <= 0) return 'critical';
    if ((p.current_stock || 0) <= (p.threshold || 0)) return 'low';
    return 'ok';
}

// ============================================
// BRANCH MANAGEMENT API (CRUD) - 5 endpoints
// ============================================

// 1. GET /api/branches - Get all branches
router.get('/branches', authenticate, (req, res) => {
    const { showAll } = req.query;
    const result = showAll === 'true' ? stores : stores.filter(s => s.is_active === true);
    res.json(result);
});

// 2. GET /api/branches/:id - Get details for a single branch
router.get('/branches/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const store = stores.find(s => s.id === id);
    
    if (!store) {
        return res.status(404).json({ message: 'Branch not found' });
    }
    
    res.json(store);
});

// 3. POST /api/branches - Create a new branch
router.post('/branches', authenticate, requireAdmin, (req, res) => {
    const { name, address, manager, phone, email } = req.body;
    
    if (!name || !address || !manager) {
        return res.status(400).json({ message: 'Missing required fields: name, address, manager' });
    }
    
    const exists = stores.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return res.status(400).json({ message: 'Branch name already exists' });
    }
    
    const newStore = {
        id: nextStoreId++,
        name,
        address,
        manager,
    phone: phone || 'Not updated',
    email: email || 'Not updated',
        is_active: true,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    stores.push(newStore);
    res.status(201).json({ message: 'Branch created successfully', branch: newStore });
});

// 4. PUT /api/branches/:id - Update a branch
router.put('/branches/:id', authenticate, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const store = stores.find(s => s.id === id);
    
    if (!store) {
        return res.status(404).json({ message: 'Branch not found' });
    }
    
    const { name, address, manager, phone, email, is_active } = req.body;
    
    if (name) store.name = name;
    if (address) store.address = address;
    if (manager) store.manager = manager;
    if (phone) store.phone = phone;
    if (email) store.email = email;
    if (is_active !== undefined) store.is_active = is_active;
    
    res.json({ message: 'Update successful', branch: store });
});

// 5. DELETE /api/branches/:id - Soft delete (disable) a branch
router.delete('/branches/:id', authenticate, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const store = stores.find(s => s.id === id);
    
    if (!store) {
        return res.status(404).json({ message: 'Branch not found' });
    }
    
    store.is_active = false;
    
    res.json({ message: 'Branch disabled', branch: store });
});

// ============================================
// OTHER API ENDPOINTS
// ============================================

router.get('/stores', (req, res) => res.json({ stores }));
// NOTE: product CRUD and listing are handled in routes/inventory.js mounted at /api/products.
// Keep api.js focused on branches, dashboard and store-level helpers to avoid duplicate endpoints.

router.get('/dashboard', authenticate, (req, res) => {
    res.json({
        totalStores: stores.filter(s => s.is_active).length,
        totalProducts: products.length,
        lowStockCount: 7,
        recentOrders: 23
    });
});

router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

router.get('/admin/dashboard', authenticate, requireAdmin, (req, res) => {
    res.json({ 
        summary: { 
            stores: stores.length, 
            products: products.length, 
            users_demo: 1 
        } 
    });
});

module.exports = router;