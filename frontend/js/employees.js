document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:3001/api';
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'index.html'; return; }

    const tableBody = document.getElementById('employeeTableBody');
    const employeeModalEl = document.getElementById('employeeModal');
    const employeeForm = document.getElementById('addEmployeeForm');
    const filterStore = document.getElementById('filterStore');

    // ✅ Lưu data vào memory, không đọc từ DOM
    let employeeData = [];
    let editingId = null;

    async function doFetch(path, opts = {}) {
        opts.headers = Object.assign({
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }, opts.headers || {});
        const res = await fetch(`${API_BASE_URL}${path}`, opts);
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
            throw new Error('unauthorized');
        }
        return res;
    }

    async function loadEmployees() {
    try {
        const res = await doFetch('/employees');
        if (!res.ok) {
            console.error('loadEmployees error:', res.status);
            return; // ← giữ nguyên employeeData, không xóa
        }
        const data = await res.json();
        employeeData = Array.isArray(data) ? data : (data.employees || []);
        renderTable();
    } catch (e) {
        if (e.message !== 'unauthorized') console.error('loadEmployees failed', e);
    }
}

    function renderTable() {
        const filterVal = filterStore ? filterStore.value : 'all';
        const filtered = filterVal === 'all'
            ? employeeData
            : employeeData.filter(e => e.store_name === filterVal);

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No employees found.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map(e => {
            const isActive = e.is_active === true;
            return `
            <tr data-id="${e.id}" class="${isActive ? '' : 'table-secondary'}">
                <td>${e.full_name}</td>
                <td>${e.role}</td>
                <td>${e.store_name || '-'}</td>
                <td>${e.shift || '-'}</td>
                <td>
                    <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary me-1"
                            onclick="openEditEmployee(${e.id})">Edit</button>
                    <button class="btn btn-sm ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}"
                            onclick="toggleEmployee(${e.id})">
                        ${isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    async function loadStores() {
        try {
            const res = await doFetch('/stores');
            const json = await res.json();
            const list = json.stores || (Array.isArray(json) ? json : []);
            if (filterStore) {
                filterStore.innerHTML = '<option value="all">All Stores</option>'
                    + list.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
            }
            // Cập nhật dropdown store trong modal
            const empStore = document.getElementById('empStore');
            if (empStore) {
                empStore.innerHTML = list.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
            }
        } catch (e) { console.error('loadStores failed', e); }
    }

    // Filter theo store — re-render từ memory, không reload API
    if (filterStore) {
        filterStore.addEventListener('change', renderTable);
    }

    // ✅ Toggle: đọc từ employeeData (memory), không từ DOM
    window.toggleEmployee = async function (id) {
        const emp = employeeData.find(e => e.id === id);
        if (!emp) return;

        const newStatus = !emp.is_active;
        console.log(`Toggle employee ${id}: ${emp.is_active} → ${newStatus}`);

        try {
            const res = await doFetch(`/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });

            console.log('Toggle response:', res.status);

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Failed to update employee status');
                return;
            }

            // ✅ Cập nhật local data ngay
            emp.is_active = newStatus;
            renderTable();
        } catch (err) {
            if (err.message !== 'unauthorized') console.error(err);
        }
    };

    // ✅ Mở modal edit — đọc từ memory
    window.openEditEmployee = function (id) {
        const emp = employeeData.find(e => e.id === id);
        if (!emp) return;
        editingId = id;

        document.getElementById('empName').value  = emp.full_name;
        document.getElementById('empRole').value  = emp.role;
        document.getElementById('empShift').value = emp.shift || 'morning';
        document.getElementById('empStore').value = emp.store_name || '';

        const titleEl = employeeModalEl.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = 'Edit Employee';

        const existing = bootstrap.Modal.getInstance(employeeModalEl);
        if (existing) existing.dispose();
        new bootstrap.Modal(employeeModalEl).show();
    };

    // Reset khi mở modal Add
    document.querySelector('[data-bs-target="#employeeModal"]')?.addEventListener('click', () => {
        editingId = null;
        employeeForm.reset();
        const titleEl = employeeModalEl.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = 'Add New Employee';
    });

    // Reset khi đóng modal
    employeeModalEl.addEventListener('hidden.bs.modal', () => {
        editingId = null;
        employeeForm.reset();
        const titleEl = employeeModalEl.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = 'Add New Employee';
    });

    // Submit form Add / Edit
    employeeForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const full_name  = document.getElementById('empName').value.trim();
        const role       = document.getElementById('empRole').value.toLowerCase(); // ✅ lowercase
        const store_name = document.getElementById('empStore').value.trim();
        const shift      = document.getElementById('empShift').value.toLowerCase();
        const email      = full_name.replace(/\s+/g, '.').toLowerCase() + '@cschain.vn';

        try {
            let res;
            if (editingId) {
                // Edit: cần auth
                res = await doFetch(`/employees/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name, role, store_name, shift })
                });
            } else {
                // Create: không cần auth header
                res = await fetch(`${API_BASE_URL}/employees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name, email, role, store_name, shift })
                });
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Failed to save employee');
                return;
            }

            bootstrap.Modal.getInstance(employeeModalEl)?.hide();
            await loadEmployees();
        } catch (err) {
            if (err.message !== 'unauthorized') {
                console.error(err);
                alert('Failed to save employee');
            }
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    loadStores();
    loadEmployees();
});