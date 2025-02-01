function initBreakEvenChart(data) {
    const ctx = document.getElementById('breakEvenChart').getContext('2d');
    
    // Calculate data points for the chart
    const months = Array.from({length: Math.ceil(data.monthsToBreakeven * 1.5)}, (_, i) => i + 1);
    
    // Calculate cumulative costs and revenue
    const cumulativeCosts = months.map(month => 
        data.startupCosts + (data.monthlyCosts * month)
    );
    
    const cumulativeRevenue = months.map(month => 
        data.monthlyRevenue * month
    );

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Total Costs',
                    data: cumulativeCosts,
                    borderColor: '#dc3545',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Total Revenue',
                    data: cumulativeRevenue,
                    borderColor: '#28a745',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Break-Even Analysis Over Time',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    },
                    grid: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            });
                        }
                    },
                    grid: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                    }
                }
            }
        }
    });
}
