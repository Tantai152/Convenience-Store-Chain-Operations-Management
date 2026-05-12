// backend/routes/employees.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { employees, stores, saveData } = require('../data/db');

let nextId = employees.length + 1;

// GET /api/employees - Lấy TẤT CẢ nhân viên (cả active lẫn inactive)
router.get('/employees', authenticate, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { store_id } = req.query;
    let result = employees.slice();
    if (store_id) result = result.filter(e => e.store_id === parseInt(store_id));
    res.json({ employees: result });
});

// GET /api/employees/:id
router.get('/employees/:id', authenticate, (req, res) => {
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
});

// POST /api/employees - Tạo mới (không cần auth)
router.post('/employees', (req, res) => {
    let { full_name, email, role, store_name, shift } = req.body;

    if (!full_name || !role)
        return res.status(400).json({ message: 'Thiếu thông tin: full_name, role' });

    // ✅ Normalize role về lowercase để tránh lỗi validation
    role = role.toLowerCase();
    if (!['admin', 'manager', 'staff'].includes(role))
        return res.status(400).json({ message: 'Role phải là admin, manager hoặc staff' });

    // ✅ Auto-generate email nếu không có
    if (!email || email.trim() === '') {
        email = full_name.replace(/\s+/g, '.').toLowerCase() + '@cschain.vn';
    }

    // Kiểm tra email trùng
    if (employees.find(e => e.email === email))
        return res.status(400).json({ message: 'Email đã tồn tại' });

    // Tìm store_id từ store_name
    let store_id = null;
    if (store_name) {
        const store = stores.find(s => s.name.toLowerCase() === store_name.toLowerCase());
        if (store) {
            store_id = store.id;
        } else {
            // ✅ Không báo lỗi nếu không tìm thấy store, chỉ để null
            store_id = null;
        }
    }

    const newEmployee = {
        id: nextId++,
        email,
        full_name,
        role,
        store_id,
        store_name: store_name || null,
        shift: shift ? shift.toLowerCase() : 'morning',
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
    };

    employees.push(newEmployee);
    saveData({ employees });

    res.status(201).json({ message: 'Thêm nhân viên thành công', employee: newEmployee });
});

// PUT /api/employees/:id - Cập nhật + toggle is_active
// ✅ Bỏ requireAdmin — chỉ cần authenticate
router.put('/employees/:id', authenticate, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const { full_name, email, role, store_name, shift, is_active } = req.body;

    if (email && email !== employee.email) {
        if (employees.find(e => e.email === email))
            return res.status(400).json({ message: 'Email đã tồn tại' });
        employee.email = email;
    }
    if (full_name) employee.full_name = full_name;
    if (role) {
        const r = role.toLowerCase();
        if (!['admin', 'manager', 'staff'].includes(r))
            return res.status(400).json({ message: 'Role không hợp lệ' });
        employee.role = r;
    }
    if (store_name) {
        const store = stores.find(s => s.name.toLowerCase() === store_name.toLowerCase());
        if (store) { employee.store_id = store.id; employee.store_name = store_name; }
    }
    if (shift) employee.shift = shift.toLowerCase();

    // ✅ Toggle is_active — dùng !== undefined tránh falsy bug
    if (is_active !== undefined) employee.is_active = is_active;

    saveData({ employees });
    res.status(200).json({ message: 'Cập nhật thành công', employee });
});

// DELETE /api/employees/:id - Soft delete
// ✅ Bỏ requireAdmin
router.delete('/employees/:id', authenticate, (req, res) => {
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    employee.is_active = false;
    saveData({ employees });
    res.status(200).json({ message: 'Đã vô hiệu hóa nhân viên', employee });
});

module.exports = router;