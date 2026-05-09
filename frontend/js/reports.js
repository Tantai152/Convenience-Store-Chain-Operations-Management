document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    let reportChart = null;

    // Fetch sales data from backend
    async function fetchSales(period='daily') {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/sales?period=${period}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch sales');
            const data = await res.json();
            return data;
        } catch (e) { console.error('fetchSales failed', e); return null; }
    }

    async function updateUI(period) {
        const data = await fetchSales(period);
        if (!data) return;

        // data is expected to be an array for period (daily/weekly/monthly)
        const labels = data.map(d => d.date || d.start || d.month);
        const values = data.map(d => d.revenue || 0);

        document.getElementById('totalRevenue').innerText = `$${values.reduce((s,v)=>s+v,0).toLocaleString()}`;
        document.getElementById('totalOrders').innerText = data.reduce((s,d)=>s+(d.order_count||0),0);
        document.getElementById('avgOrder').innerText = `$${(values.reduce((s,v)=>s+v,0)/Math.max(1,data.length)).toFixed(2)}`;

        const tableBody = document.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = data.map(d => `
                <tr>
                    <td>${d.date || (d.start+' → '+d.end) || d.month}</td>
                    <td>${d.order_count || 0}</td>
                    <td>$${(d.revenue||0).toLocaleString()}</td>
                    <td><span class="badge bg-success">Completed</span></td>
                </tr>
            `).join('');
        }

        const ctx = document.getElementById('revenueChart').getContext('2d');
        if (reportChart) reportChart.destroy();
        reportChart = new Chart(ctx, { type: 'line', data: { labels, datasets:[{ label:'Revenue ($)', data: values, borderColor:'#0d6efd', backgroundColor:'rgba(13,110,253,0.1)', fill:true }] }, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } } });
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