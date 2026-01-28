// Moved from car_depreciation_calc/index.html
// ===============================
// CONSTANTS & CONFIG
// ===============================

const BRAND_RISK = {
    "MARUTI_TOYOTA": 0.6,
    "KIA_HYUNDAI": 0.8,
    "MAHINDRA_TATA": 0.9,
    "SKODA_VW": 1.1,
    "RENAULT_OTHERS": 1.2,
};

const BRAND_REPUTATION = {
    "MARUTI_TOYOTA": "🟢 Low depreciation, very strong resale trust",
    "KIA_HYUNDAI": "🟢 Stable depreciation, predictable resale",
    "MAHINDRA_TATA": "🟡 Moderate depreciation, model matters",
    "SKODA_VW": "🔴 Higher depreciation due to ownership anxiety",
    "RENAULT_OTHERS": "🔴 Higher depreciation, weaker demand",
};

const DEPRECIATION_PROFILES = {
    "MARUTI_TOYOTA":  [0.20, 0.12, 0.10, 0.08, 0.08, 0.07, 0.07, 0.05],
    "KIA_HYUNDAI":    [0.25, 0.15, 0.12, 0.10, 0.10, 0.08, 0.08, 0.06],
    "MAHINDRA_TATA":  [0.25, 0.18, 0.15, 0.12, 0.12, 0.10, 0.10, 0.08],
    "SKODA_VW":       [0.28, 0.18, 0.15, 0.12, 0.12, 0.10, 0.10, 0.08],
    "RENAULT_OTHERS": [0.30, 0.20, 0.15, 0.12, 0.12, 0.10, 0.10, 0.08],
};

let chartInstance = null;

// ===============================
// LOGIC FUNCTIONS
// ===============================

function calculateYearwiseValues(price, years, brand) {
    const values = [price];
    const profile = DEPRECIATION_PROFILES[brand];
    let current = price;

    for (let year = 1; year <= years; year++) {
        const rate = (year <= profile.length) ? profile[year - 1] : profile[profile.length - 1];
        current *= (1 - rate);
        values.push(current);
    }
    return values;
}

function resaleRiskFactor(age, mileage, brand, expectedKmPerYear = 12000) {
    const expected = age * expectedKmPerYear;
    const ratio = mileage / expected;
    let impact = 0.0;

    if (ratio < 0.7) impact = +0.06;
    else if (ratio < 0.9) impact = +0.03;
    else if (ratio <= 1.1) impact = 0.0;
    else if (ratio <= 1.3) impact = -0.05;
    else if (ratio <= 1.6) impact = -0.10;
    else impact = -0.18;

    const ageDamping = Math.min(age / 8, 1.0);
    const adjusted = impact * (1 - 0.5 * ageDamping);
    
    const risk = 1 + adjusted * BRAND_RISK[brand];
    return Math.round(Math.max(0.70, Math.min(1.08, risk)) * 1000) / 1000;
}

function dealThresholds(value) {
    return {
        "model": value,
        "fair": value * 1.10,
        "acceptable": value * 1.15,
        "walk_away": value * 1.20,
    };
}

function priceDeltaPercentage(asking, model) {
    return ((asking - model) / model) * 100;
}

function mileageQuality(age, mileage) {
    const expectedKmPerYear = 12000;
    const ratio = mileage / (age * expectedKmPerYear);
    
    if (ratio < 0.8) return "🟢 Low mileage for its age";
    else if (ratio <= 1.2) return "🟡 Average mileage for its age";
    else return "🔴 High mileage for its age";
}

function bestAgeToBuy(values) {
    const drops = [];
    for (let i = 1; i < values.length; i++) {
        drops.push(values[i-1] - values[i]);
    }
    
    for (let i = 2; i < drops.length; i++) {
        if (drops[i] < drops[i-1] * 0.75) {
            return i; 
        }
    }
    return 3;
}

function askingPriceStatus(asking, model) {
    const delta = priceDeltaPercentage(asking, model);
    if (delta <= 5) return "🟢 Asking price is fair";
    else if (delta <= 15) return "🟡 Slightly overpriced, negotiate";
    else return "🔴 Overpriced, walk away";
}

function formatCurrency(value) {
    return "₹" + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ===============================
// UI HANDLER
// ===============================

function setupSync(rangeId, inputId) {
    const range = document.getElementById(rangeId);
    const input = document.getElementById(inputId);
    let rawValue = parseFloat(range.value);

    function updateInputDisplay(val) {
        if (inputId === 'askingPrice' && val === 0) {
            input.value = "Not Set";
        } else {
            input.value = formatCurrency(val);
        }
    }

    // Slider updates input
    range.addEventListener('input', () => {
        rawValue = parseFloat(range.value);
        updateInputDisplay(rawValue);
    });

    // Input field formatting
    input.addEventListener('focus', () => {
        if (input.value === "Not Set") {
            input.value = "";
        } else {
            // Remove formatting for editing
            input.value = rawValue.toString();
        }
    });

    input.addEventListener('blur', () => {
        let val = parseFloat(input.value.replace(/[^0-9]/g, ''));
        if (isNaN(val) || val < 0) val = 0;
        
        // Clamp to slider range
        const min = parseFloat(range.min);
        const max = parseFloat(range.max);
        val = Math.max(min, Math.min(max, val));
        
        rawValue = val;
        range.value = val;
        updateInputDisplay(val);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}

window.addEventListener('load', function() {
    setupSync('priceRange', 'price');
    setupSync('askingPriceRange', 'askingPrice');
    
    const yearsRange = document.getElementById('years');
    const yearsDisplay = document.getElementById('yearsDisplay');
    if (yearsRange && yearsDisplay) {
        yearsRange.addEventListener('input', () => {
            yearsDisplay.innerText = yearsRange.value + " years";
        });
    }
});

function calculateValuation() {
    // 1. Get Inputs
    const priceInput = document.getElementById('price').value.replace(/[^0-9]/g, '');
    const price = parseFloat(priceInput);
    const years = parseInt(document.getElementById('years').value);
    const mileage = parseInt(document.getElementById('mileage').value);
    const brand = document.getElementById('brand').value;
    const askingPriceInput = document.getElementById('askingPrice').value;
    const askingPrice = (askingPriceInput === "Not Set" || askingPriceInput === "") ? 0 : parseFloat(askingPriceInput.replace(/[^0-9]/g, ''));

    if (isNaN(price) || isNaN(years) || isNaN(mileage)) {
        alert("Please enter valid numbers.");
        return;
    }

    // 2. Calculations
    const calcYears = Math.max(years, 10);
    const values = calculateYearwiseValues(price, calcYears, brand);
    
    const baseValue = values[years];
    const riskFactor = resaleRiskFactor(years, mileage, brand);
    const finalValue = baseValue * riskFactor;
    const thresholds = dealThresholds(finalValue);
    const bestAge = bestAgeToBuy(values);

    // 3. Update UI
    document.getElementById('baseValue').innerText = formatCurrency(baseValue);
    document.getElementById('riskFactor').innerText = "×" + riskFactor.toFixed(3);
    document.getElementById('finalValue').innerText = formatCurrency(finalValue);

    document.getElementById('guidanceModel').innerText = formatCurrency(thresholds.model);
    document.getElementById('guidanceFair').innerText = formatCurrency(thresholds.fair);
    document.getElementById('guidanceAcceptable').innerText = formatCurrency(thresholds.acceptable);
    document.getElementById('guidanceWalkAway').innerText = formatCurrency(thresholds.walk_away);

    // Asking Price Logic
    const askingCard = document.getElementById('askingPriceCard');
    const summaryAskingRow = document.getElementById('summaryAskingRow');
    
    if (askingPrice > 0) {
        askingCard.style.display = 'block';
        summaryAskingRow.style.display = 'flex';
        
        const delta = priceDeltaPercentage(askingPrice, finalValue);
        document.getElementById('displayAskingPrice').innerText = formatCurrency(askingPrice);
        
        const deltaEl = document.getElementById('priceDelta');
        deltaEl.innerText = (delta > 0 ? "+" : "") + delta.toFixed(1) + "%";
        deltaEl.style.color = delta > 15 ? 'var(--danger)' : (delta > 5 ? 'var(--warning)' : 'var(--success)');

        document.getElementById('summaryAskingVerdict').innerText = askingPriceStatus(askingPrice, finalValue);
    } else {
        askingCard.style.display = 'none';
        summaryAskingRow.style.display = 'none';
    }

    // Summary
    document.getElementById('summaryBestAge').innerText = "~" + bestAge + " years";
    document.getElementById('summaryMileage').innerText = mileageQuality(years, mileage);
    document.getElementById('summaryBrandReputation').innerText = BRAND_REPUTATION[brand];

    // Show Results
    document.getElementById('resultsSection').style.display = 'block';

    // 4. Chart
    updateChart(values, bestAge);
}

function updateChart(values, bestAge) {
    const ctx = document.getElementById('depreciationChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = values.map((_, i) => `Year ${i}`);
    
    // Create point styles array
    const pointBackgroundColors = values.map((_, i) => i === bestAge ? '#10b981' : '#ffffff');
    const pointRadiuses = values.map((_, i) => i === bestAge ? 8 : 4);
    const pointBorderColors = values.map((_, i) => i === bestAge ? '#10b981' : '#e5e5e5');
    const pointBorderWidths = values.map((_, i) => i === bestAge ? 3 : 1);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Car Value (₹)',
                data: values,
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2,
                pointBackgroundColor: pointBackgroundColors,
                pointRadius: pointRadiuses,
                pointBorderColor: pointBorderColors,
                pointBorderWidth: pointBorderWidths,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#737373' } },
                tooltip: {
                    backgroundColor: '#0a0a0a',
                    titleColor: '#ffffff',
                    bodyColor: '#e5e5e5',
                    borderColor: '#1a1a1a',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            if (context.dataIndex === bestAge) {
                                label += ' (Best Age to Buy)';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: { grid: { color: '#1a1a1a' }, ticks: { color: '#737373' } },
                x: { grid: { color: '#1a1a1a' }, ticks: { color: '#737373' } }
            }
        }
    });
}
