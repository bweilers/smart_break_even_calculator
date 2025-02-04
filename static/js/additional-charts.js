function initBreakEvenUnitsChart(data) {
    const ctx = document.getElementById('breakEvenUnitsChart').getContext('2d');
    
    // Calculate break-even units at different percentages of target volume
    const monthlyFixedCosts = data.overheadCosts + data.marketingBudget;
    const unitContributionMargin = data.pricePerUnit - data.costPerUnit;
    const breakEvenUnits = monthlyFixedCosts / unitContributionMargin;
    
    // Generate data points for volumes from 0 to 150% of target
    const volumePoints = Array.from({length: 11}, (_, i) => i * 0.25 * data.targetVolume);
    const profitData = volumePoints.map(volume => {
        const revenue = volume * data.pricePerUnit;
        const costs = (volume * data.costPerUnit) + monthlyFixedCosts;
        return costs - revenue;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: volumePoints.map(v => Math.round(v)),
            datasets: [{
                label: 'Monthly Profit/Loss',
                data: profitData,
                borderColor: '#007bff',
                backgroundColor: '#007bff',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Break-Even Unit Volume Analysis',
                    font: { size: 16 }
                },
                annotation: {
                    annotations: {
                        breakEvenPoint: {
                            type: 'point',
                            xValue: Math.round(breakEvenUnits),
                            yValue: 0,
                            backgroundColor: '#000',
                            radius: 5,
                            label: {
                                content: `Break-even at ${Math.round(breakEvenUnits)} units`,
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Monthly Units'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Profit/Loss ($)'
                    },
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function initProfitMarginChart(data) {
    const ctx = document.getElementById('profitMarginChart').getContext('2d');
    
    // Calculate margins at different volumes
    const volumes = Array.from({length: 11}, (_, i) => i * 0.25 * data.targetVolume);
    const margins = volumes.map(volume => {
        const revenue = volume * data.pricePerUnit;
        const costs = (volume * data.costPerUnit) + data.overheadCosts + data.marketingBudget;
        const profit = revenue - costs;
        return revenue > 0 ? (profit / revenue) * 100 : -100;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: volumes.map(v => Math.round(v)),
            datasets: [{
                label: 'Profit Margin',
                data: margins,
                borderColor: '#28a745',
                backgroundColor: '#28a745',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Profit Margin by Sales Volume',
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Monthly Units'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Profit Margin (%)'
                    },
                    ticks: {
                        callback: value => value.toFixed(1) + '%'
                    }
                }
            }
        }
    });
}

function initCashRunwayChart(data) {
    const ctx = document.getElementById('cashRunwayChart').getContext('2d');
    
    // Calculate runway at different revenue percentages
    const percentages = Array.from({length: 11}, (_, i) => i * 0.25);
    const runways = percentages.map(percentage => {
        const monthlyRevenue = data.monthlyRevenue * percentage;
        const monthlyBurn = data.overheadCosts + data.marketingBudget;
        const monthlyCashFlow = monthlyRevenue - monthlyBurn;
        return monthlyCashFlow < 0 ? data.startupCosts / Math.abs(monthlyCashFlow) : null;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: percentages.map(p => (p * 100).toFixed(0) + '%'),
            datasets: [{
                label: 'Months of Runway',
                data: runways,
                borderColor: '#fd7e14',
                backgroundColor: '#fd7e14',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cash Runway by Revenue Achievement',
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Revenue Achievement (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Months of Runway'
                    },
                    ticks: {
                        callback: value => value?.toFixed(1) || 'Infinite'
                    }
                }
            }
        }
    });
}

function initCostStructureChart(data) {
    const ctx = document.getElementById('costStructureChart').getContext('2d');
    
    const monthlyCogs = data.costPerUnit * data.targetVolume;
    const costs = {
        'Cost of Goods': monthlyCogs,
        'Overhead': data.overheadCosts,
        'Marketing': data.marketingBudget
    };

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(costs),
            datasets: [{
                data: Object.values(costs),
                backgroundColor: ['#dc3545', '#28a745', '#007bff']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Cost Structure',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = Object.values(costs).reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initPriceSensitivityChart(data) {
    const ctx = document.getElementById('priceSensitivityChart').getContext('2d');
    
    // Calculate break-even months at different price points
    const minPrice = Math.floor(data.pricePerUnit * 0.8);
    const maxPrice = Math.ceil(data.pricePerUnit * 1.2);
    const prices = Array.from(
        {length: Math.ceil((maxPrice - minPrice) / 5) + 1},
        (_, i) => minPrice + (i * 5)
    );
    
    const breakEvenMonths = prices.map(price => {
        const newMonthlyRevenue = price * data.targetVolume;
        const monthlyCosts = (data.costPerUnit * data.targetVolume) + data.overheadCosts + data.marketingBudget;
        const monthlyProfit = newMonthlyRevenue - monthlyCosts;
        const totalInvestment = data.startupCosts + (monthlyCosts * 3);
        return monthlyProfit > 0 ? totalInvestment / monthlyProfit : null;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: prices.map(p => '$' + p),
            datasets: [{
                label: 'Months to Break-Even',
                data: breakEvenMonths,
                borderColor: '#6f42c1',
                backgroundColor: '#6f42c1',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Price Sensitivity Analysis',
                    font: { size: 16 }
                },
                annotation: {
                    annotations: {
                        currentPrice: {
                            type: 'line',
                            xMin: '$' + data.pricePerUnit,
                            xMax: '$' + data.pricePerUnit,
                            borderColor: '#666',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Current Price',
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Price Point'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Months to Break-Even'
                    },
                    ticks: {
                        callback: value => value?.toFixed(1) || 'Never'
                    }
                }
            }
        }
    });
}

function initCumulativeProfitChart(data) {
    const ctx = document.getElementById('cumulativeProfitChart').getContext('2d');
    
    // Calculate monthly values
    const monthlyRevenue = data.pricePerUnit * data.targetVolume;
    const monthlyCosts = (data.costPerUnit * data.targetVolume) + data.overheadCosts + data.marketingBudget;
    const monthlyProfit = monthlyRevenue - monthlyCosts;
    
    // Generate data for 24 months
    const months = Array.from({length: 24}, (_, i) => i);
    const cumulativeProfit = months.map(month => {
        // Month 0 is just the negative startup costs
        if (month === 0) {
            return -data.startupCosts;
        }
        
        // For all other months, add the monthly profit/loss to the previous month's total
        return -data.startupCosts + (monthlyProfit * month);
    });

    // Find break-even point (where cumulative profit crosses 0)
    const breakEvenMonth = cumulativeProfit.findIndex(profit => profit >= 0);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => 'Month ' + m),
            datasets: [{
                label: 'Cumulative Profit/Loss',
                data: cumulativeProfit,
                borderColor: '#20c997',
                backgroundColor: 'rgba(32, 201, 151, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cumulative Profit Over Time',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return 'Cumulative Profit/Loss: $' + value.toLocaleString();
                        }
                    }
                },
                annotation: {
                    annotations: {
                        breakEvenLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: '#666',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Break-Even Point',
                                enabled: true,
                                position: 'left'
                            }
                        },
                        breakEvenPoint: breakEvenMonth > 0 ? {
                            type: 'point',
                            xValue: breakEvenMonth,
                            yValue: 0,
                            backgroundColor: '#666',
                            radius: 5,
                            label: {
                                content: `Break-even at Month ${breakEvenMonth}`,
                                enabled: true,
                                position: 'top'
                            }
                        } : null
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Months)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Profit/Loss ($)'
                    },
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function initUnitEconomicsChart(data) {
    const ctx = document.getElementById('unitEconomicsChart').getContext('2d');
    
    // Calculate break-even volume
    const fixedCosts = data.overheadCosts + data.marketingBudget;
    const contributionMargin = data.pricePerUnit - data.costPerUnit;
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
    
    // Generate data points for volumes from 0 to 2x target volume
    const maxVolume = Math.max(data.targetVolume * 2, breakEvenUnits * 1.5);
    const volumes = Array.from({length: 20}, (_, i) => Math.round(i * maxVolume / 19));
    
    // Calculate revenue and cost for each volume point
    const revenueData = volumes.map(volume => data.pricePerUnit * volume);
    const costData = volumes.map(volume => (data.costPerUnit * volume) + fixedCosts);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: volumes.map(v => v.toLocaleString() + ' units'),
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true
                },
                {
                    label: 'Total Cost',
                    data: costData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue vs. Cost by Sales Volume',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw.toLocaleString();
                        }
                    }
                },
                annotation: {
                    annotations: {
                        breakEvenPoint: {
                            type: 'point',
                            xValue: volumes.findIndex(v => v >= breakEvenUnits),
                            yValue: data.pricePerUnit * breakEvenUnits,
                            backgroundColor: '#666',
                            radius: 5,
                            label: {
                                content: `Break-even at ${breakEvenUnits.toLocaleString()} units`,
                                enabled: true,
                                position: 'top'
                            }
                        },
                        targetVolume: {
                            type: 'line',
                            xMin: volumes.findIndex(v => v >= data.targetVolume),
                            xMax: volumes.findIndex(v => v >= data.targetVolume),
                            borderColor: '#007bff',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Target Volume',
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Monthly Sales Volume'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}
