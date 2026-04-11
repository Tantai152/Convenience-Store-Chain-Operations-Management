document.addEventListener('DOMContentLoaded', function() {
    // 1. KIỂM TRA BẢO MẬT (Auth Guard)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // --- HÀM HỖ TRỢ (Helper Functions) ---
    // Hàm này giúp tính toán Badge dựa trên số lượng tồn kho (Dùng chung cho Phase 4)
    function getBadgeStatus(stock, threshold) {
        if (stock === 0) {
            return `<span class="badge bg-danger">Critical</span>`;
        } else if (stock <= threshold) {
            return `<span class="badge bg-warning text-dark">Low Stock</span>`;
        } else {
            return `<span class="badge bg-success">OK</span>`;
        }
    }

    // 2. LOGIC TÌM KIẾM (Search)
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

    // 3. LOGIC NHẬP HÀNG (Restock)
    let currentRowToRestock = null;

    // Sử dụng Event Delegation để bắt sự kiện click trúng nút Restock
    document.getElementById('inventoryTableBody').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-outline-warning')) {
            currentRowToRestock = e.target.closest('tr');
            // Reset ô nhập liệu trong modal mỗi khi mở
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
                
                // Cập nhật giao diện
                stockCell.textContent = newStock;
                currentRowToRestock.cells[4].innerHTML = getBadgeStatus(newStock, threshold);

                // Đóng Modal
                restockForm.reset();
                bootstrap.Modal.getInstance(document.getElementById('restockModal')).hide();
            }
        });
    }

    // 4. LOGIC THÊM SẢN PHẨM MỚI (Add Product)
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('prodName').value;
            const category = document.getElementById('prodCategory').value;
            const stock = parseInt(document.getElementById('prodStock').value);
            const threshold = parseInt(document.getElementById('prodThreshold').value);

            const badgeHtml = getBadgeStatus(stock, threshold);

            // FIX LỖI: Thêm thuộc tính data-bs để nút bấm của dòng mới có thể mở được Modal
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

            // Dùng insertAdjacentHTML thay vì innerHTML += để giữ hiệu suất ổn định
            document.getElementById('inventoryTableBody').insertAdjacentHTML('beforeend', newRow);

            // Reset và đóng Modal
            addProductForm.reset();
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        });
    }

    // 5. XỬ LÝ LOGOUT
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});