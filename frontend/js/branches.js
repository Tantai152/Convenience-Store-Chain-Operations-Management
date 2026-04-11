document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const branchTableBody = document.getElementById('branchTableBody');
    const branchModal = new bootstrap.Modal(document.getElementById('branchModal'));
    const branchForm = document.getElementById('addBranchForm');
    const modalTitle = document.getElementById('branchModalLabel');
    let editingRow = null;

    branchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('branchName').value;
        const address = document.getElementById('branchAddress').value;
        const manager = document.getElementById('branchManager').value;

        if (editingRow) {
            editingRow.cells[0].innerText = name;
            editingRow.cells[1].innerText = address;
            editingRow.cells[2].innerText = manager;
            editingRow = null;
            modalTitle.innerText = "Add New Branch";
        } else {
            const newRow = `
                <tr>
                    <td>${name}</td>
                    <td>${address}</td>
                    <td>${manager}</td>
                    <td><span class="badge bg-success">Active</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-edit">Edit</button>
                        <button class="btn btn-sm btn-outline-danger btn-status">Deactivate</button>
                    </td>
                </tr>
            `;
            branchTableBody.insertAdjacentHTML('beforeend', newRow);
        }

        branchForm.reset();
        branchModal.hide();
    });

    branchTableBody.addEventListener('click', function(e) {
        const row = e.target.closest('tr');

        if (e.target.classList.contains('btn-status')) {
            const statusBadge = row.cells[3].querySelector('.badge');
            if (e.target.innerText === 'Deactivate') {
                statusBadge.className = 'badge bg-secondary';
                statusBadge.innerText = 'Inactive';
                e.target.innerText = 'Activate';
                e.target.classList.replace('btn-outline-danger', 'btn-outline-success');
            } else {
                statusBadge.className = 'badge bg-success';
                statusBadge.innerText = 'Active';
                e.target.innerText = 'Deactivate';
                e.target.classList.replace('btn-outline-success', 'btn-outline-danger');
            }
        }

        if (e.target.classList.contains('btn-edit')) {
            editingRow = row;
            modalTitle.innerText = "Edit Branch";
            document.getElementById('branchName').value = row.cells[0].innerText;
            document.getElementById('branchAddress').value = row.cells[1].innerText;
            document.getElementById('branchManager').value = row.cells[2].innerText;
            branchModal.show();
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});