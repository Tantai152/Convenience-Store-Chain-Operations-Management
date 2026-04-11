document.getElementById('addProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('prodName').value;
    const category = document.getElementById('prodCategory').value;
    
    const stock = parseInt(document.getElementById('prodStock').value);
    const threshold = parseInt(document.getElementById('prodThreshold').value);

    let badgeHtml = '';
    
    if (stock === 0) {
        badgeHtml = `<span class="badge bg-danger">Critical</span>`;
    } else if (stock <= threshold) {
        badgeHtml = `<span class="badge bg-warning text-dark">Low Stock</span>`;
    } else {
        badgeHtml = `<span class="badge bg-success">OK</span>`;
    }

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

    document.getElementById('inventoryTableBody').innerHTML += newRow;

    document.getElementById('addProductForm').reset();
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modalInstance.hide();
 
});

document.addEventListener('DOMContentLoaded', function() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            });
        }

        const addProductForm = document.getElementById('addProductForm');
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // 1. Lấy giá trị đầu vào
            const name = document.getElementById('prodName').value;
            const category = document.getElementById('prodCategory').value;
            const stock = parseInt(document.getElementById('prodStock').value);
            const threshold = parseInt(document.getElementById('prodThreshold').value);

            let badgeHtml = '';
            if (stock === 0) {
                badgeHtml = `<span class="badge bg-danger">Critical</span>`;
            } else if (stock <= threshold) {
                badgeHtml = `<span class="badge bg-warning text-dark">Low Stock</span>`;
            } else {
                badgeHtml = `<span class="badge bg-success">OK</span>`;
            }

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

            document.getElementById('inventoryTableBody').innerHTML += newRow;

            addProductForm.reset();
            const modalElement = document.getElementById('productModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        });
    }
});
