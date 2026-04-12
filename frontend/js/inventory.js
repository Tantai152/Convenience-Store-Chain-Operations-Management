document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const searchInput = document.getElementById('searchProduct');
    let currentRowId = null; 

    function getBadgeStatus(status) {
        const mapping = {
            'ok': 'bg-success',
            'low': 'bg-warning text-dark',
            'critical': 'bg-danger'
        };
        return `<span class="badge ${mapping[status] || 'bg-secondary'}">${status.toUpperCase()}</span>`;
    }

    async function loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const products = await response.json();
                renderTable(products);
            }
        } catch (error) {
            console.error('Không thể kết nối server:', error);
        }
    }

    function renderTable(products) {
        inventoryTableBody.innerHTML = products.map(product => `
            <tr data-id="${product.id}">
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td class="fw-bold">${product.current_stock}</td>
                <td style="display:none">${product.stock_threshold}</td>
                <td>${getBadgeStatus(product.stock_status)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" 
                            data-bs-toggle="modal" 
                            data-bs-target="#restockModal">Restock</button>
                </td>
            </tr>
        `).join('');
    }

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

    document.getElementById('inventoryTableBody').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-outline-warning')) {
            const row = e.target.closest('tr');
            currentRowId = row.getAttribute('data-id'); // Lấy ID sản phẩm
            document.getElementById('restockAmount').value = "";
        }
    });

    const restockForm = document.getElementById('restockForm');
    if (restockForm) {
        restockForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const quantity = parseInt(document.getElementById('restockAmount').value);

            if (currentRowId && quantity >= 0) {
                try {
                    const response = await fetch(`${API_BASE_URL}/products/${currentRowId}/stock`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ quantity: quantity }) // Thay thế số lượng tồn kho
                    });

                    if (response.ok) {
                        loadProducts(); // Load lại bảng để cập nhật số lượng và Badge mới
                        bootstrap.Modal.getInstance(document.getElementById('restockModal')).hide();
                    }
                } catch (error) {
                    alert("Cập nhật kho thất bại!");
                }
            }
        });
    }

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const productData = {
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                price: parseInt(document.getElementById('prodPrice').value || 0), // Thêm Price theo yêu cầu API
                stock_threshold: parseInt(document.getElementById('prodThreshold').value)
            };

            try {
                const response = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });

                if (response.ok) {
                    loadProducts();
                    addProductForm.reset();
                    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
                }
            } catch (error) {
                alert("Không thể thêm sản phẩm!");
            }
        });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    loadProducts();
});