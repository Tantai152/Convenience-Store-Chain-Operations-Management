const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { employees, stores, saveData } = require('../data/db');

let nextId = employees.length + 1;

// ============================================
// GET /api/employees - Lấy danh sách nhân viên
// ============================================
router.get('/employees', authenticate, (req, res) => {
    const { store_id, showAll } = req.query;
    // By default return all employees so frontend can render active/inactive rows explicitly.
    let result = employees.slice();

    if (store_id) {
        result = result.filter(e => e.store_id === parseInt(store_id));
    }

    if (!showAll || showAll === 'false') {
        // frontend can control showing inactive via query param
        // but default behaviour is to include inactive as requested by UX
    }

    res.json({ employees: result });
});

// ============================================
// GET /api/employees/:id - Lấy chi tiết 1 nhân viên
// ============================================
router.get('/employees/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const employee = employees.find(e => e.id === id);
    
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
});

// ============================================
// POST /api/employees - Tạo nhân viên mới
// NOTE: This endpoint is intentionally public for demo usage (no auth required)
// ============================================
router.post('/employees', (req, res) => {
    const { full_name, email, role, store_name, shift } = req.body;
    
    // Validation
    if (!full_name || !email || !role) {
        return res.status(400).json({ message: 'Thiếu thông tin: full_name, email, role' });
    }
    
    if (!['admin', 'manager', 'staff'].includes(role)) {
        return res.status(400).json({ message: 'Role phải là admin, manager hoặc staff' });
    }
    
    // Kiểm tra email trùng
    if (employees.find(e => e.email === email)) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    
    // Tìm store_id từ store_name
    let store_id = null;
    if (store_name) {
        const store = stores.find(s => s.name.toLowerCase() === store_name.toLowerCase());
        if (store) {
            store_id = store.id;
        } else {
            return res.status(400).json({ message: 'Không tìm thấy chi nhánh: ' + store_name });
        }
    }
    
    const newEmployee = {
        id: nextId++,
        email,
        full_name,
        role,
        store_id,
        store_name: store_name || null,
        shift: shift || 'morning',
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
    };
    
    employees.push(newEmployee);
    saveData({ employees });
    
    res.status(201).json({ message: 'Thêm nhân viên thành công', employee: newEmployee });
});

// ============================================
// PUT /api/employees/:id - Cập nhật nhân viên
// ============================================
router.put('/employees/:id', authenticate, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const employee = employees.find(e => e.id === id);
    
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    
    const { full_name, email, role, store_name, shift, is_active } = req.body;
    
    if (email && email !== employee.email) {
        if (employees.find(e => e.email === email)) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        employee.email = email;
    }
    
    if (full_name) employee.full_name = full_name;
    if (role) {
        if (!['admin', 'manager', 'staff'].includes(role)) {
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }
        employee.role = role;
    }
    if (store_name) {
        const store = stores.find(s => s.name.toLowerCase() === store_name.toLowerCase());
        if (store) {
            employee.store_id = store.id;
            employee.store_name = store_name;
        }
    }
    if (shift) employee.shift = shift;
    if (is_active !== undefined) employee.is_active = is_active;
    
    saveData({ employees });
    res.json({ message: 'Cập nhật thành công', employee });
});

// ============================================
// DELETE /api/employees/:id - Xóa mềm
// ============================================
router.delete('/employees/:id', authenticate, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const employee = employees.find(e => e.id === id);
    
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    
    employee.is_active = false;
    saveData({ employees });
    
    res.json({ message: 'Đã vô hiệu hóa nhân viên', employee });
});

module.exports = router;