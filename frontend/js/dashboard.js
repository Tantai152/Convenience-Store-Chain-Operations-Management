document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:3001/api';
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    loadDashboard(token);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
});

async function loadDashboard(token) {
    const API_BASE_URL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:3001/api';
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUI(data);
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } else {
            useMockData();
        }
    } catch (error) {
        useMockData();
    }
}

function updateUI(data) {
    const kpis = {
        'kpi-stores': data.totalStores ?? data.total_stores ?? 0,
        'kpi-products': data.totalProducts ?? data.total_products ?? 0,
        'kpi-low-stock': data.lowStockCount ?? data.low_stock_count ?? 0,
        'kpi-orders': data.recentOrders ?? data.today_orders_count ?? 0
    };

    for (const [id, value] of Object.entries(kpis)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }

    // ✅ FIX: nhận đúng key từ cả API lẫn mockData
    const weekly = data.weekly_sales || data.weekly || data.weeklySales;
    if (Array.isArray(weekly)) {
        const chartData = {
            labels: weekly.map(s => s.date),    // ✅ dùng .date
            data: weekly.map(s => s.revenue)    // ✅ dùng .revenue
        };
        renderChart(chartData);
    }
}

function useMockData() {
    const mockData = {
        // ✅ FIX: đúng key để updateUI map được vào KPI cards
        totalStores: 5,
        totalProducts: 12,
        lowStockCount: 7,
        today_orders_count: 23,
        // ✅ FIX: dùng weekly_sales + date + revenue cho nhất quán
        weekly_sales: [
            { date: 'Mon', revenue: 1200 },
            { date: 'Tue', revenue: 1900 },
            { date: 'Wed', revenue: 1500 },
            { date: 'Thu', revenue: 2100 },
            { date: 'Fri', revenue: 2800 },
            { date: 'Sat', revenue: 3500 },
            { date: 'Sun', revenue: 3100 }
        ]
    };
    updateUI(mockData);
}

function renderChart(chartData) {
    const ctx = document.getElementById('revenueBarChart');
    if (!ctx) return;

    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    // ✅ FIX: nhận { labels, data } thay vì array weeklySales
    window.myChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Revenue ($)',
                data: chartData.data,
                backgroundColor: 'rgba(13, 110, 253, 0.8)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true }
            }
        }
    });
}