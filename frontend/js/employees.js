document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:3001/api';
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('employeeTableBody');
    const modalTitle = document.getElementById('modalTitle');
    const employeeForm = document.getElementById('addEmployeeForm');
    const filterStore = document.getElementById('filterStore');

    async function doFetch(path, opts={}) {
        opts.headers = Object.assign({ 'Authorization': `Bearer ${token}` }, opts.headers || {});
        const res = await fetch(`${API_BASE_URL}${path}`, opts);
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = 'index.html'; throw new Error('unauthorized'); }
        return res;
    }

    async function loadEmployees() {
        try {
            const res = await doFetch('/employees');
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.employees || []);
            tableBody.innerHTML = list.map(e => `
                <tr data-id="${e.id}" class="${e.is_active ? '' : 'table-secondary'}">
                    <td>${e.full_name}</td>
                    <td>${e.role}</td>
                    <td>${e.store_name || ''}</td>
                    <td>${e.shift || ''}</td>
                    <td>
                        <span class="badge ${e.is_active ? 'bg-success' : 'bg-secondary'}">
                            ${e.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" onclick="openEditEmployee(${e.id})">Edit</button>
                        <button class="btn btn-sm ${e.is_active ? 'btn-outline-danger' : 'btn-outline-success'}" onclick="toggleEmployee(${e.id}, ${e.is_active})">
                            ${e.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error('loadEmployees failed', e); }
    }

    async function loadStores() {
        try {
            const res = await fetch(`${API_BASE_URL}/stores`, { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            const list = json.stores || json;
            if (filterStore) {
                filterStore.innerHTML = ['<option value="all">All</option>'].concat(list.map(s => `<option value="${s.name}">${s.name}</option>`)).join('');
            }
        } catch(e) { console.error('loadStores failed', e); }
    }

    document.getElementById('filterStore').addEventListener('change', function() {
        const selectedStore = this.value;
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const storeInRow = row.cells[2].textContent;
            row.style.display = (selectedStore === 'all' || storeInRow === selectedStore) ? "" : "none";
        });
    });

    tableBody.addEventListener('click', async function(e) {
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const statusCell = row.cells[4];

        // Toggle Active/Inactive
        if (e.target.classList.contains('toggle-btn')) {
            const isActive = statusCell.textContent.trim() === 'Active';
            try {
                const res = await doFetch(`/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !isActive }) });
                if (res.ok) {
                    loadEmployees();
                }
            } catch (err) { console.error(err); }
        }

        // Edit button
        if (e.target.classList.contains('edit-btn') || e.target.innerText === 'Edit') {
            modalTitle.innerText = "Edit Employee Information";
            document.getElementById('empName').value = row.cells[0].textContent;
            document.getElementById('empRole').value = row.cells[1].textContent.trim();
            document.getElementById('empStore').value = row.cells[2].textContent;
            document.getElementById('empShift').value = row.cells[3].textContent;
        }
    });

    document.querySelector('[data-bs-target="#employeeModal"]').addEventListener('click', () => {
        modalTitle.innerText = "Add New Employee";
        employeeForm.reset();
    });

    async function createEmployee(formData) {
        // Create employee WITHOUT Authorization header as requested
        const res = await fetch(`${API_BASE_URL}/employees`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        const data = await res.json();
        console.log('Create employee response:', res.status, data);
        if (!res.ok) throw new Error(data.message || 'Failed to create');
        await loadEmployees();
    }

    employeeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const full_name = document.getElementById('empName').value;
        const role = document.getElementById('empRole').value;
        const store_name = document.getElementById('empStore').value;
        const shift = document.getElementById('empShift').value;
            try {
                await createEmployee({ full_name, email: full_name.replace(/\s+/g,'.').toLowerCase()+'@cschain.vn', role, store_name, shift });
                bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
            } catch (err) { console.error(err); alert('Failed to create employee'); }
    });

    // Expose functions for inline onclick handlers
    window.openEditEmployee = function(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        document.getElementById('empName').value = row.cells[0].textContent;
        document.getElementById('empRole').value = row.cells[1].textContent.trim();
        document.getElementById('empStore').value = row.cells[2].textContent;
        document.getElementById('empShift').value = row.cells[3].textContent;
        bootstrap.Modal.getInstance(document.getElementById('employeeModal')) || new bootstrap.Modal(document.getElementById('employeeModal'));
        const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
        modal.show();
    };

    window.toggleEmployee = async function(id, isActive) {
        try {
            const res = await doFetch(`/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !isActive }) });
            if (res.ok) await loadEmployees();
        } catch (err) { console.error(err); }
    };

    loadStores();
    loadEmployees();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});