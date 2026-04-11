console.log("File dashboard.js đã tải thành công!"); // Dòng này để kiểm tra console

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token'); 

    // Tạm thời comment đoạn này để test nếu bạn chưa làm trang Login hoàn chỉnh
    // if (!token) { window.location.href = 'index.html'; return; }

    console.log("DOM đã sẵn sàng, đang gọi loadDashboard...");
    loadDashboard(token);

    // Logout handling
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
});

async function loadDashboard(token) {
    try {
        const response = await fetch('/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUI(data);
        } else {
            console.warn("API không phản hồi, đang dùng dữ liệu giả.");
            useMockData();
        }
    } catch (error) {
        console.error('Lỗi kết nối server:', error);
        useMockData();
    }
}

function updateUI(data) {
    console.log("Đang cập nhật UI với dữ liệu:", data);
    document.getElementById('kpi-stores').innerText = data.totalBranches;
    document.getElementById('kpi-products').innerText = data.totalProducts;
    document.getElementById('kpi-low-stock').innerText = data.lowStockItems;
    document.getElementById('kpi-orders').innerText = data.todayOrders;
    
    // Gọi hàm vẽ biểu đồ
    renderChart(data.weeklySales);
}

function useMockData() {
    const mockData = {
        totalBranches: 5,
        totalProducts: 150,
        lowStockItems: 10,
        todayOrders: 25,
        weeklySales: [
            {day: 'Mon', sales: 100}, {day: 'Tue', sales: 200}, 
            {day: 'Wed', sales: 150}, {day: 'Thu', sales: 300}, 
            {day: 'Fri', sales: 250}, {day: 'Sat', sales: 400}, 
            {day: 'Sun', sales: 350}
        ]
    };
    updateUI(mockData);
}

// HÀM VẼ BIỂU ĐỒ - PHẢI CÓ HÀM NÀY
function renderChart(weeklySales) {
    const ctx = document.getElementById('revenueBarChart');
    if (!ctx) {
        console.error("Không tìm thấy thẻ canvas 'revenueBarChart'!");
        return;
    }

    const labels = weeklySales.map(item => item.day);
    const salesData = weeklySales.map(item => item.sales);

    // Xóa biểu đồ cũ nếu có để tránh lỗi khi render lại
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu ($)',
                data: salesData,
                backgroundColor: '#0d6efd',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}