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
    // map backend keys to UI ids (backend uses camelCase)
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

    // backend may return weekly sales arrays under 'weekly_sales' or 'weekly'
    const weekly = data.weekly_sales || data.weekly || data.weeklySales;
    if (Array.isArray(weekly)) {
        const chartData = {
            labels: weekly.map(s => s.date),
            data: weekly.map(s => s.revenue)
        };
        renderChart(chartData);
    }
}

function useMockData() {
    const mockData = {
        totalBranches: 12,
        totalProducts: 450,
        lowStockItems: 8,
        todayOrders: 124,
        weeklySales: [
            {day: 'Mon', sales: 1200}, {day: 'Tue', sales: 1900}, 
            {day: 'Wed', sales: 1500}, {day: 'Thu', sales: 2100}, 
            {day: 'Fri', sales: 2800}, {day: 'Sat', sales: 3500}, 
            {day: 'Sun', sales: 3100}
        ]
    };
    updateUI(mockData);
}

function renderChart(weeklySales) {
    const ctx = document.getElementById('revenueBarChart');
    if (!ctx) return;

    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: weeklySales.map(item => item.day),
            datasets: [{
                label: 'Revenue ($)',
                data: weeklySales.map(item => item.sales),
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