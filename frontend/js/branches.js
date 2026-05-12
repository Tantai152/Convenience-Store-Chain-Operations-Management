document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:3001/api';
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html';

    const tableBody = document.getElementById('branchTableBody');
    const branchModalEl = document.getElementById('branchModal');
    let editingId = null;

    async function doFetch(path, opts = {}) {
        opts.headers = Object.assign({ 'Authorization': `Bearer ${token}` }, opts.headers || {});
        const res = await fetch(`${API_BASE_URL}${path}`, opts);
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
            throw new Error('unauthorized');
        }
        return res;
    }

    async function loadBranches() {
        try {
            const res = await doFetch('/branches');
            const json = await res.json();
            const list = Array.isArray(json) ? json : (json.branches || []);

            if (list.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No branches found.</td></tr>';
                return;
            }

            tableBody.innerHTML = list.map(b => {
                const isActive = b.status === 'active';
                return `
                <tr data-id="${b.id}" data-status="${b.status}" class="${isActive ? '' : 'table-secondary'}">
                    <td>${b.name}</td>
                    <td>${b.address || ''}</td>
                    <td>${b.manager || '-'}</td>
                    <td>
                        <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
                            ${isActive ? 'Active' : 'Disabled'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1"
                                onclick="openEditModal(${b.id})">Edit</button>
                        <button class="btn btn-sm ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}"
                                onclick="toggleBranch(${b.id}, '${b.status}')">
                            ${isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>`;
            }).join('');
        } catch (e) {
            if (e.message !== 'unauthorized') console.error('Failed to load branches', e);
        }
    }

    // ✅ Cả Activate lẫn Deactivate đều dùng PUT /branches/:id với { status }
    // Không cần PATCH /restore nữa — tránh lỗi endpoint not found
    window.toggleBranch = async function (id, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const res = await doFetch(`/branches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Failed to update branch status');
                return;
            }
            await loadBranches();
        } catch (err) {
            if (err.message !== 'unauthorized') console.error(err);
        }
    };

    window.openEditModal = function (id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        editingId = id;
        document.getElementById('branchName').value    = row.cells[0].textContent.trim();
        document.getElementById('branchAddress').value = row.cells[1].textContent.trim();
        document.getElementById('branchManager').value = row.cells[2].textContent.trim();
        document.getElementById('branchModalLabel').textContent = 'Edit Branch';
        const existing = bootstrap.Modal.getInstance(branchModalEl);
        if (existing) existing.dispose();
        new bootstrap.Modal(branchModalEl).show();
    };

    document.getElementById('addBranchForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const name    = document.getElementById('branchName').value.trim();
        const address = document.getElementById('branchAddress').value.trim();
        const manager = document.getElementById('branchManager').value.trim();
        try {
            const res = await doFetch(editingId ? `/branches/${editingId}` : '/branches', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, manager })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Failed to save branch');
                return;
            }
            bootstrap.Modal.getInstance(branchModalEl)?.hide();
            await loadBranches();
        } catch (e) {
            if (e.message !== 'unauthorized') { console.error(e); alert('Failed to save branch'); }
        }
    });

    branchModalEl.addEventListener('hidden.bs.modal', () => {
        editingId = null;
        document.getElementById('addBranchForm').reset();
        document.getElementById('branchModalLabel').textContent = 'Add New Branch';
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    loadBranches();
}); 