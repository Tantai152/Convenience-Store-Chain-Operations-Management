// 1. Setup mock data for different time periods
const chartData = {
    daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [1200, 1500, 1100, 1800, 2200, 2500, 2150]
    },
    weekly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [8500, 9200, 7800, 10500]
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar'],
        data: [35000, 42000, 38500]
    }
};

// 2. Initialize the Chart.js instance on the canvas element
const ctx = document.getElementById('revenueChart').getContext('2d');
let revenueChart = new Chart(ctx, {
    type: 'line', // Line chart for trend visualization
    data: {
        labels: chartData.daily.labels, // Default load is daily
        datasets: [{
            label: 'Revenue ($)',
            data: chartData.daily.data,
            borderColor: '#0d6efd', // Bootstrap primary blue
            backgroundColor: 'rgba(13, 110, 253, 0.1)', // Light blue fill
            borderWidth: 2,
            fill: true,
            tension: 0.3 // Adds slight curve to the line
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false } // Hide legend for cleaner look
        }
    }
});

// 3. Function to update chart data dynamically
function updateChart(period) {
    revenueChart.data.labels = chartData[period].labels;
    revenueChart.data.datasets[0].data = chartData[period].data;
    revenueChart.update();
}

// 4. Attach event listeners to the toggle buttons
document.getElementById('btnDaily').addEventListener('click', () => updateChart('daily'));
document.getElementById('btnWeekly').addEventListener('click', () => updateChart('weekly'));
document.getElementById('btnMonthly').addEventListener('click', () => updateChart('monthly'));