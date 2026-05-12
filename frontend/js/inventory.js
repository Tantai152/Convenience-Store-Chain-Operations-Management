document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // CONFIG - API_BASE_URL từ config.js hoặc fallback
    // ============================================
    const API_BASE_URL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:3001/api';

    // ============================================
    // CHECK LOGIN
    // ============================================
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const searchInput = document.getElementById('searchProduct');
    const restockForm = document.getElementById('restockForm');
    const restockAmount = document.getElementById('restockAmount');
    const addProductForm = document.getElementById('addProductForm');
    let currentRowId = null;

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function getBadgeStatus(status) {
        if (!status) return '<span class="badge bg-secondary">UNKNOWN</span>';
        const mapping = {
            'ok': 'bg-success',
            'low': 'bg-warning text-dark',
            'critical': 'bg-danger'
        };
        return `<span class="badge ${mapping[status] || 'bg-secondary'}">${status.toUpperCase()}</span>`;
    }

    // ============================================
    // LOAD PRODUCTS TỪ API
    // ============================================
    async function loadProducts() {
        try {
            // Call inventory API on the backend
            const response = await fetch(`${API_BASE_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.warn('Unauthorized - redirecting to login');
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                    return;
                }
                let errBody = null;
                try { errBody = await response.json(); } catch(e) { /* ignore */ }
                const msg = (errBody && (errBody.error || errBody.message)) 
                    ? (errBody.error || errBody.message) 
                    : `HTTP ${response.status}`;
                throw new Error(msg);
            }

            const data = await response.json();
            console.log('📦 Products response:', data);

            // Xử lý cả array và object
            let products = [];
            if (Array.isArray(data)) {
                products = data;
            } else if (data.products) {
                products = data.products;
            } else if (data.data) {
                products = data.data;
            } else {
                console.warn('⚠️ Dữ liệu không đúng định dạng:', data);
            }

            renderTable(products);
        } catch (error) {
            console.error('❌ Không thể kết nối server:', error);
            if (inventoryTableBody) {
                inventoryTableBody.innerHTML = `
                    <tr><td colspan="6" class="text-center text-danger">
                        ⚠️ Không thể kết nối server: ${String(error.message || error).replace(/</g,'&lt;')}
                    </td></tr>
                `;
            }
        }
    }

    // ============================================
    // RENDER BẢNG SẢN PHẨM
    // ============================================
    function renderTable(products) {
        if (!inventoryTableBody) {
            console.error('❌ Không tìm thấy element #inventoryTableBody');
            return;
        }

        if (!Array.isArray(products) || products.length === 0) {
            inventoryTableBody.innerHTML = `
                <tr><td colspan="6" class="text-center">Không có sản phẩm nào</td></tr>
            `;
            return;
        }

        inventoryTableBody.innerHTML = products.map(product => `
            <tr data-id="${product.id}">
                <td>${product.name || ''}</td>
                <td>${product.category || 'Chưa phân loại'}</td>
                <td class="fw-bold">${product.current_stock ?? product.stock ?? 0}</td>
                <td>${product.threshold ?? product.stock_threshold ?? 0}</td>
                <td>${getBadgeStatus(product.status || product.stock_status)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning restock-btn" 
                            data-bs-toggle="modal" 
                            data-bs-target="#restockModal">
                        📦 Restock
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ============================================
    // SEARCH FILTER
    // ============================================
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#inventoryTableBody tr');
            rows.forEach(row => {
                const productName = row.cells[0]?.textContent?.toLowerCase() || '';
                row.style.display = productName.includes(filter) ? '' : 'none';
            });
        });
    }

    // ============================================
    // CLICK RESTOCK BUTTON
    // ============================================
    if (inventoryTableBody) {
        inventoryTableBody.addEventListener('click', function(e) {
            const restockBtn = e.target.closest('.restock-btn');
            if (restockBtn) {
                const row = restockBtn.closest('tr');
                currentRowId = row.getAttribute('data-id');
                console.log('📦 Restock cho sản phẩm ID:', currentRowId);
                if (restockAmount) {
                    restockAmount.value = '';
                }
            }
        });
    }

    // ============================================
    // FORM RESTOCK (Nhập kho)
    // ============================================
    if (restockForm && restockAmount) {
    restockForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const quantity = parseInt(restockAmount.value);

        if (!currentRowId) {
            alert('Vui lòng chọn sản phẩm để nhập kho!');
            return;
        }

        if (isNaN(quantity) || quantity < 0) {
            alert('Vui lòng nhập số lượng hợp lệ!');
            return;
        }

        try {
            // Try a list of candidate endpoints until one succeeds (200/201/204)
            const candidates = [
                { method: 'PUT', path: `/products/${currentRowId}/stock` },
                { method: 'PUT', path: `/products/${currentRowId}/restock` },
                { method: 'PATCH', path: `/products/${currentRowId}/stock` },
                { method: 'POST', path: `/products/${currentRowId}/stock` }
            ];

            let success = false;
            for (const c of candidates) {
                const url = `${API_BASE_URL}${c.path}`;
                console.log('🔧 Restock attempt:', c.method, url, 'quantity=', quantity);
                try {
                    const response = await fetch(url, {
                        method: c.method,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ quantity: quantity })
                    });

                    console.log('🔧 Restock status for', c.path, ':', response.status);

                    if (response.ok) {
                        const data = await response.json().catch(()=>null);
                        console.log('✅ Restock succeeded on', c.path, data);
                        success = true;
                        await loadProducts();
                        const modal = bootstrap.Modal.getInstance(document.getElementById('restockModal'));
                        if (modal) modal.hide();
                        alert('✅ Cập nhật kho thành công!');
                        break;
                    }
                } catch (innerErr) {
                    console.warn('⚠️ Attempt failed for', c.path, innerErr);
                }
            }

            if (!success) {
                alert('❌ Cập nhật kho thất bại: tất cả các endpoint trả về lỗi hoặc 404. Xem Console để biết chi tiết.');
            }
        } catch (error) {
            console.error('❌ Lỗi restock:', error);
            alert('❌ Cập nhật kho thất bại! Xem Console (F12) để biết chi tiết.');
        }
    });
    } else {
        console.warn('⚠️ Không tìm thấy form #restockForm hoặc input #restockAmount');
    }

    // ============================================
    // FORM THÊM SẢN PHẨM MỚI
    // ============================================
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const prodName = document.getElementById('prodName');
            const prodCategory = document.getElementById('prodCategory');
            const prodStock = document.getElementById('prodStock');
            const prodThreshold = document.getElementById('prodThreshold');

            // 🔧 SỬA: Bỏ kiểm tra prodPrice (không tồn tại)
            if (!prodName) {
                alert('Không tìm thấy form fields!');
                return;
            }

            const productData = {
                name: prodName.value.trim(),
                category: prodCategory?.value?.trim() || 'Chưa phân loại',
                price: 1000,  // Giá mặc định
                threshold: parseInt(prodThreshold?.value || 10),
                current_stock: parseInt(prodStock?.value || 0)
            };

            if (!productData.name) {
                alert('Vui lòng nhập tên sản phẩm!');
                return;
            }

            try {
                // POST new product to inventory API
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
                    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                    if (modal) modal.hide();
                } else {
                    const err = await response.json();
                    alert('Lỗi: ' + (err.message || 'Không thể thêm sản phẩm'));
                }
            } catch (error) {
                console.error('❌ Lỗi thêm sản phẩm:', error);
                alert('Không thể thêm sản phẩm! Kiểm tra kết nối server.');
            }
        });
    }

    // ============================================
    // LOGOUT
    // ============================================
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // ============================================
    // LOAD INITIAL DATA
    // ============================================
    loadProducts();
});