document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    let reportChart = null;

    const mockData = {
        daily: {
            summary: { revenue: 1200, orders: 45, avg: 26.6 },
            labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
            data: [100, 300, 450, 400, 600, 800, 750],
            orders: Array(5).fill({ id: 'ORD-001', date: 'Today, 10:30 AM', store: 'District 1 Store', amount: 25.0 })
        },
        weekly: {
            summary: { revenue: 12450, orders: 342, avg: 36.4 },
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [1200, 1500, 1100, 1800, 2200, 2500, 2150],
            orders: Array(10).fill({ id: 'ORD-002', date: '2024-04-10', store: 'District 3 Store', amount: 45.5 })
        },
        monthly: {
            summary: { revenue: 52000, orders: 1420, avg: 36.6 },
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [11000, 13000, 15000, 13000],
            orders: Array(10).fill({ id: 'ORD-003', date: '2024-03-15', store: 'District 1 Store', amount: 12.5 })
        }
    };

    function updateUI(period) {
        const selected = mockData[period];
        
        document.getElementById('totalRevenue').innerText = `$${selected.summary.revenue.toLocaleString()}`;
        document.getElementById('totalOrders').innerText = selected.summary.orders;
        document.getElementById('avgOrder').innerText = `$${selected.summary.avg.toFixed(2)}`;

        const tableBody = document.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = selected.orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.date}</td>
                    <td>${order.store}</td>
                    <td>$${order.amount.toFixed(2)}</td>
                    <td><span class="badge bg-success">Completed</span></td>
                </tr>
            `).join('');
        }

        const ctx = document.getElementById('revenueChart').getContext('2d');
        if (reportChart) {
            reportChart.destroy();
        }

        reportChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: selected.labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: selected.data,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.3
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

    document.getElementById('btnDaily').addEventListener('click', () => updateUI('daily'));
    document.getElementById('btnWeekly').addEventListener('click', () => updateUI('weekly'));
    document.getElementById('btnMonthly').addEventListener('click', () => updateUI('monthly'));

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    updateUI('daily');
});