document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('employeeTableBody');
    const modalTitle = document.getElementById('modalTitle');
    const employeeForm = document.getElementById('addEmployeeForm');

    document.getElementById('filterStore').addEventListener('change', function() {
        const selectedStore = this.value;
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const storeInRow = row.cells[2].textContent;
            if (selectedStore === 'all' || storeInRow === selectedStore) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    tableBody.addEventListener('click', function(e) {
        const row = e.target.closest('tr');
        
        if (e.target.classList.contains('btn-outline-danger')) {
            const statusCell = row.cells[4];
            statusCell.innerHTML = '<span class="badge bg-secondary">Inactive</span>';
            e.target.innerText = 'Activate';
            e.target.classList.replace('btn-outline-danger', 'btn-outline-success');
        } 
        else if (e.target.classList.contains('btn-outline-success')) {
            const statusCell = row.cells[4];
            statusCell.innerHTML = '<span class="badge bg-success">Active</span>';
            e.target.innerText = 'Deactivate';
            e.target.classList.replace('btn-outline-success', 'btn-outline-danger');
        }
        
        if (e.target.innerText === 'Edit') {
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

    employeeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
        alert("Employee data saved!");
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});