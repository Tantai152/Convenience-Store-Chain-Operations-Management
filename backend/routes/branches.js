// backend/routes/branches.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

let branches = [
    { id: 1, name: 'CS Chain - Quận 1',     address: '123 Lê Lợi, Quận 1, TP.HCM',                     manager: 'Nguyễn Văn An', phone: '0901234567', email: 'q1@cschain.vn', status: 'active',   createdAt: '2024-01-15' },
    { id: 2, name: 'CS Chain - Quận 3',     address: '456 Võ Văn Tần, Quận 3, TP.HCM',                  manager: 'Trần Thị Bình', phone: '0902234567', email: 'q3@cschain.vn', status: 'active',   createdAt: '2024-02-01' },
    { id: 3, name: 'CS Chain - Bình Thạnh', address: '789 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM', manager: 'Lê Văn Cường',  phone: '0903234567', email: 'bt@cschain.vn', status: 'active',   createdAt: '2024-02-15' },
    { id: 4, name: 'CS Chain - Phú Nhuận',  address: '321 Phan Đăng Lưu, Quận Phú Nhuận, TP.HCM',      manager: 'Phạm Thị Dung', phone: '0904234567', email: 'pn@cschain.vn', status: 'inactive', createdAt: '2024-01-20' },
    { id: 5, name: 'CS Chain - Gò Vấp',     address: '555 Nguyễn Văn Lượng, Quận Gò Vấp, TP.HCM',      manager: 'Hoàng Văn Em',  phone: '0905234567', email: 'gv@cschain.vn', status: 'active',   createdAt: '2024-03-01' },
];
let nextId = branches.length + 1;

// GET /api/branches — luôn trả về TẤT CẢ
router.get('/', authenticate, (req, res) => {
    // Disable cache để tránh 304
    res.set('Cache-Control', 'no-store');
    res.json(branches);
});

// GET /api/branches/:id
router.get('/:id', authenticate, (req, res) => {
    const branch = branches.find(b => b.id === parseInt(req.params.id));
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
});

// POST /api/branches — tạo mới
router.post('/', authenticate, (req, res) => {
    const { name, address, manager, phone, email } = req.body;
    if (!name || !address || !manager)
        return res.status(400).json({ message: 'Required: name, address, manager' });
    if (branches.find(b => b.name.toLowerCase() === name.toLowerCase()))
        return res.status(400).json({ message: 'Branch name already exists' });

    const newBranch = {
        id: nextId++, name, address, manager,
        phone: phone || '',
        email: email || '',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    };
    branches.push(newBranch);
    res.status(201).json({ message: 'Branch created successfully', branch: newBranch });
});

// PUT /api/branches/:id — update info + toggle status
router.put('/:id', authenticate, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const branch = branches.find(b => b.id === parseInt(req.params.id));
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    const { name, address, manager, phone, email, status } = req.body;
    if (name    !== undefined) branch.name    = name;
    if (address !== undefined) branch.address = address;
    if (manager !== undefined) branch.manager = manager;
    if (phone   !== undefined) branch.phone   = phone;
    if (email   !== undefined) branch.email   = email;
    // ✅ Dùng !== undefined thay vì if(status) để tránh falsy bug
    if (status  !== undefined) branch.status  = status;

    // Luôn trả 200, không bao giờ 304
    res.status(200).json({ message: 'Branch updated successfully', branch });
});

// DELETE /api/branches/:id — soft delete
router.delete('/:id', authenticate, (req, res) => {
    const branch = branches.find(b => b.id === parseInt(req.params.id));
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    branch.status = 'inactive';
    res.status(200).json({ message: 'Branch disabled', branch });
});

module.exports = router;