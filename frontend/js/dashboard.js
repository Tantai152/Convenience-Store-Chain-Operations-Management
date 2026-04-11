document.addEventListener('DOMContentLoaded', function() {
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
            useMockData();
        }
    } catch (error) {
        useMockData();
    }
}

function updateUI(data) {
    const kpis = {
        'kpi-stores': data.totalBranches,
        'kpi-products': data.totalProducts,
        'kpi-low-stock': data.lowStockItems,
        'kpi-orders': data.todayOrders
    };

    for (const [id, value] of Object.entries(kpis)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }

    if (data.weeklySales) {
        renderChart(data.weeklySales);
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