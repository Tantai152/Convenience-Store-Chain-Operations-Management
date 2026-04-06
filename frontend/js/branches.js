document.getElementById('addBranchForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. Get values from the input fields
    const name = document.getElementById('branchName').value;
    const address = document.getElementById('branchAddress').value;
    const manager = document.getElementById('branchManager').value;

    // 2. Get the table body where we will add the new row
    const tableBody = document.getElementById('branchTableBody');

    // 3. Create a new HTML row using template literals
    const newRow = `
        <tr>
            <td>${name}</td>
            <td>${address}</td>
            <td>${manager}</td>
            <td><span class="badge bg-success">Active</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary">Edit</button>
                <button class="btn btn-sm btn-outline-danger">Deactivate</button>
            </td>
        </tr>
    `;

    // 4. Append the new row to the existing table content
    tableBody.innerHTML += newRow;

    // 5. Clear the form inputs after successful submission
    document.getElementById('addBranchForm').reset();

    // 6. Close the Bootstrap modal programmatically
    const modalElement = document.getElementById('branchModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
});