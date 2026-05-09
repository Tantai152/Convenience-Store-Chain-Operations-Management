// backend/routes/branches.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// ============================================
// DEMO DATA (no database required)
// ============================================
let branches = [
    {
        id: 1,
        name: 'CS Chain - Quận 1',
        address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
        manager: 'Nguyễn Văn An',
        phone: '0901234567',
        email: 'q1@cschain.vn',
        status: 'active',
        createdAt: '2024-01-15'
    },
    {
        id: 2,
        name: 'CS Chain - Quận 3',
        address: '456 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
        manager: 'Trần Thị Bình',
        phone: '0902234567',
        email: 'q3@cschain.vn',
        status: 'active',
        createdAt: '2024-02-01'
    },
    {
        id: 3,
        name: 'CS Chain - Bình Thạnh',
        address: '789 Xô Viết Nghệ Tĩnh, Phường 26, Quận Bình Thạnh, TP.HCM',
        manager: 'Lê Văn Cường',
        phone: '0903234567',
        email: 'bt@cschain.vn',
        status: 'active',
        createdAt: '2024-02-15'
    },
    {
        id: 4,
        name: 'CS Chain - Phú Nhuận',
        address: '321 Phan Đăng Lưu, Phường 3, Quận Phú Nhuận, TP.HCM',
        manager: 'Phạm Thị Dung',
        phone: '0904234567',
        email: 'pn@cschain.vn',
        status: 'inactive',
        createdAt: '2024-01-20'
    },
    {
        id: 5,
        name: 'CS Chain - Gò Vấp',
        address: '555 Nguyễn Văn Lượng, Phường 17, Quận Gò Vấp, TP.HCM',
        manager: 'Hoàng Văn Em',
        phone: '0905234567',
        email: 'gv@cschain.vn',
        status: 'active',
        createdAt: '2024-03-01'
    }
];

// Auto-increment ID counter
let nextId = branches.length + 1;

// ============================================
// API ENDPOINTS
// ============================================

// 1. GET /api/branches - Get list of all branches
router.get('/', authenticateToken, (req, res) => {
    // Filter: return only active branches by default
    const { showAll } = req.query;
    const result = showAll === 'true' ? branches : branches.filter(b => b.status === 'active');
    res.json(result);
});

// 2. GET /api/branches/:id - Get details of a branch
router.get('/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const branch = branches.find(b => b.id === id);

    if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(branch);
});

// 3. POST /api/branches - Create a new branch
router.post('/', authenticateToken, (req, res) => {
    const { name, address, manager, phone, email } = req.body;

    // Basic validation
    if (!name || !address || !manager) {
        return res.status(400).json({ 
            message: 'Please provide required fields: name, address, manager' 
        });
    }

    // Check for duplicate name
    const exists = branches.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return res.status(400).json({ message: 'Branch name already exists' });
    }

    // Create a new branch
    const newBranch = {
        id: nextId++,
        name,
        address,
        manager,
        phone: phone || 'Not updated',
        email: email || 'Not updated',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    };

    branches.push(newBranch);
    res.status(201).json({
        message: 'Branch created successfully',
        branch: newBranch
    });
});

// 4. PUT /api/branches/:id - Update branch information
router.put('/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const branch = branches.find(b => b.id === id);

    if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
    }

    const { name, address, manager, phone, email, status } = req.body;

    // Update fields if provided
    if (name) branch.name = name;
    if (address) branch.address = address;
    if (manager) branch.manager = manager;
    if (phone) branch.phone = phone;
    if (email) branch.email = email;
    if (status) branch.status = status;

    res.json({
        message: 'Branch updated successfully',
        branch: branch
    });
});

// 5. DELETE /api/branches/:id - Soft delete (disable) a branch
router.delete('/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const branch = branches.find(b => b.id === id);

    if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
    }

    // Soft delete: set status to inactive
    branch.status = 'inactive';

    res.json({
        message: 'Branch disabled',
        branch: branch
    });
});

// 6. PATCH /api/branches/:id/restore - Restore a previously disabled branch
router.patch('/:id/restore', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const branch = branches.find(b => b.id === id);

    if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
    }

    branch.status = 'active';

    res.json({
        message: 'Branch restored',
        branch: branch
    });
});

module.exports = router;