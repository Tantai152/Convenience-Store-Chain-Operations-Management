document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token'); 

    if (!token) {
        window.location.href = 'index.html'; // Redirect to login if not authenticated
        return;
    }

    // Load initial data
    loadDashboard(token);

    // Logout handling
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
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

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
            return;
        }

        const data = await response.json();

        // Update KPI Cards
        document.getElementById('kpi-stores').innerText = data.totalBranches;
        document.getElementById('kpi-products').innerText = data.totalProducts;
        document.getElementById('kpi-low-stock').innerText = data.lowStockItems;
        document.getElementById('kpi-orders').innerText = data.todayOrders;

        // Render Bar Chart
        renderChart(data.weeklySales);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

function renderChart(weeklySales) {
    const ctx = document.getElementById('revenueBarChart').getContext('2d');
    
    // Assumes weeklySales is an array: [{day: 'Mon', sales: 150}, ...]
    const labels = weeklySales.map(item => item.day);
    const salesData = weeklySales.map(item => item.sales);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales ($)',
                data: salesData,
                backgroundColor: '#0d6efd',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}