// Listen for the Add Employee form submission
document.getElementById('addEmployeeForm').addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // 1. Retrieve data from inputs
    const name = document.getElementById('empName').value;
    const role = document.getElementById('empRole').value;
    const shift = document.getElementById('empShift').value;
    const store = document.getElementById('empStore').value;

    // 2. Set badge color based on role (Manager = gray, Staff = light blue)
    let roleBadge = '';
    if (role === 'Manager') {
        roleBadge = `<span class="badge bg-secondary">${role}</span>`;
    } else {
        roleBadge = `<span class="badge bg-info text-dark">${role}</span>`;
    }

    // 3. Create a new row with the extracted data
    const newRow = `
        <tr>
            <td>${name}</td>
            <td>${roleBadge}</td>
            <td>${store}</td>
            <td>${shift}</td>
            <td><span class="badge bg-success">Active</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary">Edit</button>
                <button class="btn btn-sm btn-outline-danger">Deactivate</button>
            </td>
        </tr>
    `;

    // 4. Append the new row to the table body
    document.getElementById('employeeTableBody').innerHTML += newRow;

    // 5. Reset form and hide modal
    document.getElementById('addEmployeeForm').reset();
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
    modalInstance.hide();
});