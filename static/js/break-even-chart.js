function initBreakEvenChart(data) {
    const ctx = document.getElementById('breakEvenChart').getContext('2d');
    
    // Calculate data points for the chart - extend a bit beyond break-even point
    const months = Array.from({length: Math.ceil(data.monthsToBreakeven * 1.5)}, (_, i) => i);
    
    // Calculate cumulative revenue line (straight line from 0)
    const cumulativeRevenue = months.map(month => 
        data.monthlyRevenue * month  // Revenue starts at 0 and increases by monthlyRevenue each month
    );
    
    // Calculate cumulative costs line (starts at startup costs)
    const cumulativeCosts = months.map(month => 
        data.startupCosts + (data.monthlyCosts * month)  // Costs start at startupCosts and increase by monthlyCosts each month
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
                    backgroundColor: '#dc3545',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Total Revenue',
                    data: cumulativeRevenue,
                    borderColor: '#28a745',
                    backgroundColor: '#28a745',
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
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            });
                        }
                    }
                },
                annotation: {
                    annotations: {
                        breakEvenLine: {
                            type: 'line',
                            xMin: data.monthsToBreakeven,
                            xMax: data.monthsToBreakeven,
                            borderColor: '#666',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: `Break-even point: ${data.monthsToBreakeven.toFixed(1)} months`,
                                enabled: true,
                                position: 'top'
                            }
                        },
                        breakEvenPoint: {
                            type: 'point',
                            xValue: data.monthsToBreakeven,
                            yValue: data.startupCosts + (data.monthlyCosts * data.monthsToBreakeven), // Y value at break-even point
                            backgroundColor: '#000',
                            radius: 5
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
                    },
                    ticks: {
                        callback: function(value) {
                            return Math.floor(value);  // Show only whole numbers for months
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Amount ($)'
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
