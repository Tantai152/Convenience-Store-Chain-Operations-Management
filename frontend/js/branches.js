document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html';

    const tableBody = document.getElementById('branchTableBody');

    async function loadBranches() {
        try {
            const res = await fetch(`${API_BASE_URL}/stores`, { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            const list = json.stores || json;
            tableBody.innerHTML = list.map(s => `
                <tr>
                    <td>${s.name}</td>
                    <td>${s.address || ''}</td>
                    <td>${s.manager || ''}</td>
                    <td>${s.is_active ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Disabled</span>'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">Edit</button>
                        <button class="btn btn-sm btn-outline-danger">Deactivate</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            console.error('Failed to load branches', e);
        }
    }

    document.getElementById('addBranchForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('branchName').value;
        const address = document.getElementById('branchAddress').value;
        const manager = document.getElementById('branchManager').value;
        try {
            const res = await fetch(`${API_BASE_URL}/branches`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name, address, manager }) });
            if (res.ok) {
                await loadBranches();
                document.getElementById('addBranchForm').reset();
                bootstrap.Modal.getInstance(document.getElementById('branchModal')).hide();
            } else {
                const err = await res.json(); alert(err.message || err.error || 'Failed to create branch');
            }
        } catch (e) { console.error(e); alert('Failed to create branch'); }
    });

    loadBranches();
});