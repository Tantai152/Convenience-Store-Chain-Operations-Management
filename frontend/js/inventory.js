document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    
    function getBadgeStatus(stock, threshold) {
        if (stock === 0) {
            return `<span class="badge bg-danger">Critical</span>`;
        } else if (stock <= threshold) {
            return `<span class="badge bg-warning text-dark">Low Stock</span>`;
        } else {
            return `<span class="badge bg-success">OK</span>`;
        }
    }

    
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#inventoryTableBody tr');

            rows.forEach(row => {
                const productName = row.cells[0].textContent.toLowerCase();
                row.style.display = productName.includes(filter) ? "" : "none";
            });
        });
    }

    
    let currentRowToRestock = null;

    
    document.getElementById('inventoryTableBody').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-outline-warning')) {
            currentRowToRestock = e.target.closest('tr');
            
            document.getElementById('restockAmount').value = "";
        }
    });

    const restockForm = document.getElementById('restockForm');
    if (restockForm) {
        restockForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const amountToAdd = parseInt(document.getElementById('restockAmount').value);
            if (currentRowToRestock && amountToAdd > 0) {
                const stockCell = currentRowToRestock.cells[2];
                const threshold = parseInt(currentRowToRestock.cells[3].textContent);
                
                const newStock = parseInt(stockCell.textContent) + amountToAdd;
                
                
                stockCell.textContent = newStock;
                currentRowToRestock.cells[4].innerHTML = getBadgeStatus(newStock, threshold);

               
                restockForm.reset();
                bootstrap.Modal.getInstance(document.getElementById('restockModal')).hide();
            }
        });
    }

    
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('prodName').value;
            const category = document.getElementById('prodCategory').value;
            const stock = parseInt(document.getElementById('prodStock').value);
            const threshold = parseInt(document.getElementById('prodThreshold').value);

            const badgeHtml = getBadgeStatus(stock, threshold);

            
            const newRow = `
                <tr>
                    <td>${name}</td>
                    <td>${category}</td>
                    <td>${stock}</td>
                    <td>${threshold}</td>
                    <td>${badgeHtml}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#productModal">Edit</button>
                        <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#restockModal">Restock</button>
                    </td>
                </tr>
            `;

            
            document.getElementById('inventoryTableBody').insertAdjacentHTML('beforeend', newRow);

            
            addProductForm.reset();
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});