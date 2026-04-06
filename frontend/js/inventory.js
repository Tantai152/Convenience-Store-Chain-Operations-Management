// Listen for the Add Product form submission
document.getElementById('addProductForm').addEventListener('submit', function(event) {
    // Prevent the page from reloading
    event.preventDefault();

    // 1. Get user input values
    const name = document.getElementById('prodName').value;
    const category = document.getElementById('prodCategory').value;
    
    // Parse numbers to compare them later
    const stock = parseInt(document.getElementById('prodStock').value);
    const threshold = parseInt(document.getElementById('prodThreshold').value);

    // 2. Determine the status badge color based on stock levels
    let badgeHtml = '';
    
    if (stock === 0) {
        // Critical: Out of stock
        badgeHtml = `<span class="badge bg-danger">Critical</span>`;
    } else if (stock <= threshold) {
        // Warning: Stock is low
        badgeHtml = `<span class="badge bg-warning text-dark">Low Stock</span>`;
    } else {
        // Success: Stock is healthy
        badgeHtml = `<span class="badge bg-success">OK</span>`;
    }

    // 3. Create the new table row
    const newRow = `
        <tr>
            <td>${name}</td>
            <td>${category}</td>
            <td>${stock}</td>
            <td>${threshold}</td>
            <td>${badgeHtml}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary">Edit</button>
                <button class="btn btn-sm btn-outline-warning">Restock</button>
            </td>
        </tr>
    `;

    // 4. Append the row to the table body
    document.getElementById('inventoryTableBody').innerHTML += newRow;

    // 5. Reset the form and close the modal
    document.getElementById('addProductForm').reset();
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modalInstance.hide();
});