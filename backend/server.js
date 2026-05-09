// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log('=>', req.method, req.originalUrl || req.url);
    next();
});

app.use((req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && !req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
    next();
});

// ============================================
// ROUTES - Mount chuyên biệt TRƯỚC, api.js SAU
// ============================================

// Auth Routes
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (err) { console.warn('⚠️ Auth routes not found'); }

// Employee Routes (mount TRƯỚC api.js)
try {
    const emp = require('./routes/employees');
    app.use('/api', emp);
    console.log('✅ Employee routes loaded');
} catch(e) { console.warn('⚠️ Employee routes not found'); }

// Inventory Routes (mount TRƯỚC api.js)
try {
    const inv = require('./routes/inventory');
    app.use('/api', inv);
    console.log('✅ Inventory routes loaded');
} catch(e) { console.warn('⚠️ Inventory routes not found'); }

// Order Routes
try {
    const ord = require('./routes/orders');
    app.use('/api', ord);
    console.log('✅ Order routes loaded');
} catch(e) { console.warn('⚠️ Order routes not found'); }

// Sales Routes
try {
    const sales = require('./routes/sales');
    app.use('/api', sales);
    console.log('✅ Sales routes loaded');
} catch(e) { console.warn('⚠️ Sales routes not found'); }

// API Routes (Dashboard, Branches, Stores) - MOUNT CUỐI CÙNG
try {
    const apiRoutes = require('./routes/api');
    app.use('/api', apiRoutes);
    console.log('✅ API routes loaded');
} catch (err) { console.warn('⚠️ API routes not found'); }

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    console.warn('404 for', req.method, req.originalUrl || req.url);
    res.status(404).json({ message: 'API endpoint not found' });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════');
    console.log(`📧 Demo login: ${process.env.ADMIN_EMAIL || 'admin@cschain.vn'}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('═══════════════════════════════════════');
});