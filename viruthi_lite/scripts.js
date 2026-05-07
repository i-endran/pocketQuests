// scripts.js
// Main application logic for Viruthi Lite

Chart.register(ChartDataLabels);

const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
        if (chart.config.type !== 'doughnut') return;
        const width = chart.width;
        const height = chart.height;
        const ctx = chart.ctx;
        
        ctx.restore();
        
        const dataset = chart.data.datasets[0];
        if (!dataset) return;
        const meta = chart.getDatasetMeta(0);
        let total = 0;
        meta.data.forEach((element, index) => {
            if (!element.hidden) {
                total += dataset.data[index];
            }
        });

        const text = "₹" + formatINR(total);
        const fontSize = Math.round(height / 10);
        ctx.font = "bold " + fontSize + "px Outfit, sans-serif";
        ctx.textBaseline = "middle";
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? "#f8fafc" : "#1e293b"; 
        
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2 - (fontSize * 0.1);
        ctx.fillText(text, textX, textY);
        
        const subFontSize = Math.max(10, Math.round(fontSize * 0.4));
        ctx.font = "bold " + subFontSize + "px Outfit, sans-serif";
        ctx.fillStyle = isDark ? "#cbd5e1" : "#94a3b8";
        const subText = "TOTAL";
        const subTextX = Math.round((width - ctx.measureText(subText).width) / 2);
        ctx.fillText(subText, subTextX, textY + fontSize * 0.8);

        ctx.save();
    }
};

Chart.register(centerTextPlugin);

let portfolio = [
    { id: 1, type: 'Equity', label: 'IN Stocks', value: 100000 },
    { id: 2, type: 'Equity', label: 'US Stocks', value: 220000 },
    { id: 3, type: 'Equity', label: 'IN MF', value: 300000 },
    { id: 4, type: 'Commodity', label: 'Gold', value: 500000 },
    { id: 5, type: 'Commodity', label: 'Silver', value: 50000 },
    { id: 6, type: 'Debt', label: 'Bonds', value: 400000 }
];

let networthItems = { assets: [{ name: 'Vehicle', value: 500000, capitalType: 'Depreciatable Asset' }], realEstate: [], depreciatableAssets: [], liabilities: [{ name: 'Credit Card', value: 25000 }] };
let currentStrategy = 'balanced';
let selectedHoldingFilter = 'All';
let selectedNWHoldingFilter = 'All';
let appHistory = [];
let charts = {};

function navigate(page) {
    document.querySelectorAll('[id^="page-"]').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${page}`).classList.remove('hidden');
    document.querySelectorAll('.nav-pill').forEach(n => n.classList.remove('active', 'text-white'));
    const activeNav = document.getElementById(`nav-${page}`);
    activeNav.classList.add('active', 'text-white');
    if (page === 'portfolio') renderPortfolio();
    if (page === 'networth') renderNetWorth();
    if (page === 'history') renderHistory();
}

function toggleModal(show) { 
    document.getElementById('modal-container').classList.toggle('hidden', !show); 
    if (show) toggleModalFields(); 
}

function toggleModalFields() {
    const type = document.getElementById('m-type').value;
    document.getElementById('m-std-fields').classList.toggle('hidden', type === 'Commodity');
    document.getElementById('m-commodity-fields').classList.toggle('hidden', type !== 'Commodity');
}

function saveAsset() {
    const type = document.getElementById('m-type').value;
    const label = document.getElementById('m-label').value || type;
    let val = 0;
    
    if (type === 'Commodity') {
        const weight = parseFloat(document.getElementById('m-weight').value) || 0;
        const price = parseFloat(document.getElementById('m-price').value) || 0;
        val = weight * price;
    } else {
        const stdValue = parseFloat(document.getElementById('m-value').value) || 0;
        const currency = document.getElementById('m-curr').value;
        val = stdValue * (currency === 'USD' ? USD_TO_INR : 1);
    }
    
    if (val <= 0) return;
    portfolio.push({ id: Date.now(), type, label, value: val });
    toggleModal(false); 
    renderPortfolio();
}

function deleteAsset(id) { 
    portfolio = portfolio.filter(p => p.id !== id); 
    renderPortfolio(); 
}

function updatePortfolioItem(id, field, value) {
    const item = portfolio.find(p => p.id === id);
    if (!item) return;
    
    if (field === 'value') {
        item.value = parseFloat(value) || 0;
    } else {
        item[field] = value;
    }
    
    renderPortfolio();
}

function updateStrategy() {
    currentStrategy = document.getElementById('strategy-select').value;
    document.getElementById('custom-ratios').classList.toggle('hidden', currentStrategy !== 'custom');
    renderPortfolio();
}

function applyCustomStrategy() {
    const e = parseFloat(document.getElementById('custom-equity').value) || 0;
    const d = parseFloat(document.getElementById('custom-debt').value) || 0;
    const c = parseFloat(document.getElementById('custom-comm').value) || 0;
    STRATEGY_PRESETS.custom = { Equity: e, Debt: d, Commodity: c };
    renderPortfolio();
}

function applyHoldingFilter(filter) {
    selectedHoldingFilter = filter;
    document.getElementById('holding-filter').value = filter;
    renderPortfolio();
}

function applyNWHoldingFilter(filter) {
    selectedNWHoldingFilter = filter;
    document.getElementById('nw-holding-filter').value = filter;
    renderNetWorth();
}

function renderPortfolio() {
    const body = document.getElementById('p-table-body'); 
    body.innerHTML = '';
    let total = 0; 
    const typeMap = { Equity: 0, Debt: 0, Commodity: 0, 'Real Estate': 0, Cash: 0 };
    const labelMap = {};

    portfolio.forEach(a => {
        total += a.value;
        typeMap[a.type] = (typeMap[a.type] || 0) + a.value;
        if (selectedHoldingFilter === 'All' || a.type === selectedHoldingFilter) {
            labelMap[a.label] = (labelMap[a.label] || 0) + a.value;
        }
        
        const typeOptions = ['Equity', 'Commodity', 'Debt', 'Cash'].map(t => 
            `<option value="${t}" ${a.type === t ? 'selected' : ''}>${t}</option>`
        ).join('');

        body.innerHTML += `
            <tr class="group hover:bg-slate-50/50 transition-colors">
                <td class="px-8 py-5 font-bold text-slate-800">${a.label}</td>
                <td class="px-8 py-5">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase" style="background-color: ${ASSET_COLORS[a.type]}15; color: ${ASSET_COLORS[a.type]}">${a.type}</span>
                </td>
                <td class="px-8 py-5">
                    <div class="flex items-center justify-end gap-2">
                        <span class="text-slate-400 font-bold text-sm">₹</span>
                        <input type="number" value="${a.value}" onchange="updatePortfolioItem(${a.id}, 'value', this.value)" class="bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 text-right w-36">
                    </div>
                </td>
                <td class="px-8 py-5 text-right opacity-0 group-hover:opacity-100">
                    <button onclick="deleteAsset(${a.id})" class="text-slate-300 hover:text-rose-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>`;
    });

    document.getElementById('p-total-value').innerText = `₹${formatINR(total)}`;
    document.getElementById('p-asset-count').innerText = `${portfolio.length} Items`;
    
    let topClass = 'None';
    let maxVal = 0; 
    Object.entries(typeMap).forEach(([k, v]) => { 
        if (v > maxVal) { 
            maxVal = v; 
            topClass = k; 
        } 
    });
    document.getElementById('p-top-class').innerText = topClass;

    updateCharts(typeMap, labelMap, total);
}

function updateCharts(typeData, labelData, total) {
    const chartConfig = { 
        cutout: '75%', 
        plugins: { 
            legend: { 
                display: true, 
                position: 'bottom', 
                labels: { usePointStyle: true, font: { family: 'Outfit', size: 10 } } 
            }, 
            datalabels: { 
                color: '#fff', 
                font: { weight: 'bold', size: 10 }, 
                formatter: (v, ctx) => { 
                    const t = ctx.dataset.data.reduce((a, b) => a + b, 0); 
                    return (v / t * 100).toFixed(1) + '%'; 
                }, 
                display: (ctx) => (ctx.dataset.data[ctx.dataIndex] / ctx.dataset.data.reduce((a, b) => a + b, 0)) > 0.05 
            } 
        }, 
        maintainAspectRatio: false 
    };

    if (charts.pType) charts.pType.destroy();
    charts.pType = new Chart(document.getElementById('chart-p-type'), { 
        type: 'doughnut', 
        data: { 
            labels: Object.keys(typeData).filter(k => typeData[k] > 0), 
            datasets: [{ 
                data: Object.values(typeData).filter(v => v > 0), 
                backgroundColor: Object.keys(typeData).filter(k => typeData[k] > 0).map(k => ASSET_COLORS[k] || ASSET_COLORS.Default), 
                borderWidth: 0 
            }] 
        }, 
        options: {
            ...chartConfig,
            onClick: (event, elements, chart) => {
                if (elements.length > 0) {
                    const idx = elements[0].index;
                    const label = chart.data.labels[idx];
                    applyHoldingFilter(label);
                } else {
                    applyHoldingFilter('All');
                }
            }
        }
    });

    if (charts.pLabel) charts.pLabel.destroy();
    charts.pLabel = new Chart(document.getElementById('chart-p-label'), { 
        type: 'doughnut', 
        data: { 
            labels: Object.keys(labelData), 
            datasets: [{ 
                data: Object.values(labelData), 
                backgroundColor: ['#4f46e5', '#0ea5e9', '#2dd4bf', '#a855f7', '#64748b', '#ec4899', '#f97316'], 
                borderWidth: 0 
            }] 
        }, 
        options: chartConfig 
    });

    updateDeltaChart(typeData, total);
}

function updateDeltaChart(current, total) {
    const target = STRATEGY_PRESETS[currentStrategy];
    const categories = ['Equity', 'Debt', 'Commodity'];
    const currentPct = categories.map(c => (current[c] / total * 100) || 0);
    const targetPct = categories.map(c => target[c] || 0);

    if (charts.delta) charts.delta.destroy();
    charts.delta = new Chart(document.getElementById('chart-strategy-delta'), {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                { label: 'Current %', data: currentPct, backgroundColor: '#6366f1', borderRadius: 8 },
                { label: 'Target %', data: targetPct, backgroundColor: '#cbd5e1', borderRadius: 8 }
            ]
        },
        options: {
            indexAxis: 'y',
            scales: { x: { max: 100, ticks: { callback: v => v + '%' } }, y: { grid: { display: false } } },
            plugins: { datalabels: { display: false }, legend: { position: 'bottom', labels: { font: { family: 'Outfit' } } } },
            maintainAspectRatio: false
        }
    });

    const container = document.getElementById('delta-recommendations');
    container.innerHTML = '';
    let isAligned = true;

    categories.forEach(cat => {
        const diffPct = target[cat] - (current[cat] / total * 100 || 0);
        const diffVal = (diffPct / 100) * total;
        if (Math.abs(diffPct) > 5) isAligned = false;

        const color = diffVal > 0 ? 'emerald' : 'rose';
        const action = diffVal > 0 ? 'Buy' : 'Sell';

        container.innerHTML += `
            <div class="p-4 bg-${color}-50 border border-${color}-100 rounded-2xl">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-bold uppercase text-${color}-600">${cat} Delta</span>
                    <span class="text-xs font-bold text-${color}-700">${diffPct.toFixed(1)}%</span>
                </div>
                <p class="text-sm font-bold text-slate-800">${action} ₹${formatINR(Math.abs(diffVal))}</p>
            </div>
        `;
    });

    const status = document.getElementById('rebalance-status');
    status.innerText = isAligned ? 'Aligned' : 'Out of Sync';
    status.className = `text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${isAligned ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`;
}

function renderNetWorth() {
    const pVal = portfolio.reduce((a, c) => a + c.value, 0);
    const aVal = networthItems.assets.reduce((a, c) => a + c.value, 0);
    const rVal = networthItems.realEstate ? networthItems.realEstate.reduce((a, c) => a + c.value, 0) : 0;
    const dVal = networthItems.depreciatableAssets ? networthItems.depreciatableAssets.reduce((a, c) => a + c.value, 0) : 0;
    const lVal = networthItems.liabilities.reduce((a, c) => a + c.value, 0);
    
    let workingCapital = pVal; 
    let workingAsset = 0;
    let frozenNetWorth = 0;
    let depreciatableAsset = 0;

    const allAssets = [
        ...(networthItems.assets || []),
        ...(networthItems.realEstate || []),
        ...(networthItems.depreciatableAssets || [])
    ];

    allAssets.forEach(item => {
        let cType = item.capitalType;
        if (!cType) {
            if (networthItems.assets && networthItems.assets.includes(item)) cType = 'Frozen Capital';
            else if (networthItems.realEstate && networthItems.realEstate.includes(item)) cType = 'Working Asset';
            else if (networthItems.depreciatableAssets && networthItems.depreciatableAssets.includes(item)) cType = 'Depreciatable Asset';
            else cType = 'Working Capital';
            item.capitalType = cType;
        }

        if (cType === 'Working Capital') {
            workingCapital += item.value;
        } else if (cType === 'Working Asset') {
            workingAsset += item.value;
        } else if (cType === 'Frozen Capital' || cType === 'Frozen Asset') {
            frozenNetWorth += item.value;
        } else if (cType === 'Depreciatable Asset') {
            depreciatableAsset += item.value;
        }
    });

    const trueNetWorth = workingCapital + workingAsset + frozenNetWorth + depreciatableAsset - lVal;
    const fireNetWorth = workingCapital + workingAsset - lVal;

    document.getElementById('nw-total-value').innerText = `₹${formatINR(trueNetWorth)}`;
    document.getElementById('nw-fire-value').innerText = `₹${formatINR(fireNetWorth)}`;
    document.getElementById('nw-sum-working-cap').innerText = `₹${formatINR(workingCapital)}`;
    document.getElementById('nw-sum-working-asset').innerText = `₹${formatINR(workingAsset)}`;
    document.getElementById('nw-sum-frozen-nw').innerText = `₹${formatINR(frozenNetWorth)}`;
    document.getElementById('nw-sum-depreciatable').innerText = `₹${formatINR(depreciatableAsset)}`;
    document.getElementById('nw-sum-loans').innerText = `₹${formatINR(lVal)}`;
    document.getElementById('nw-portfolio-total').innerText = `₹${formatINR(pVal)}`;

    renderNWList('nw-realestate-list', networthItems.realEstate || [], 'realEstate');
    renderNWList('nw-assets-list', networthItems.assets, 'asset');
    renderNWList('nw-depreciatable-list', networthItems.depreciatableAssets || [], 'depreciatable');
    renderNWList('nw-liabilities-list', networthItems.liabilities, 'liability');
    
    const totalAssets = workingCapital + workingAsset + frozenNetWorth + depreciatableAsset;
    updateNWChart(totalAssets, lVal);
    updateNWAssetCharts(pVal, aVal, rVal, dVal);
}

function renderNWList(id, items, cat) {
    const container = document.getElementById(id); 
    container.innerHTML = '';
    
    const capTypeOptions = ['Working Capital', 'Frozen Capital', 'Frozen Asset', 'Working Asset', 'Depreciatable Asset'];
    
    items.forEach((it, i) => {
        let typeDropdown = '';
        if (cat !== 'liability') {
            const opts = capTypeOptions.map(t => `<option value="${t}" ${it.capitalType === t ? 'selected' : ''}>${t}</option>`).join('');
            typeDropdown = `<select onchange="updateNWItem('${cat}', ${i}, 'capitalType', this.value)" class="mt-1 text-[10px] font-bold p-1 bg-white border border-slate-200 rounded-lg text-slate-500 max-w-[140px] focus:ring-0 cursor-pointer">${opts}</select>`;
        }

        let weightRateUI = '';
        let valueUI = '';

        if (cat === 'asset') {
            if (it.isWeightBased) {
                weightRateUI = `
                    <div class="flex items-center gap-1">
                        <input type="number" value="${it.weight || 0}" placeholder="Wgt" onchange="updateNWItem('${cat}', ${i}, 'weight', this.value)" class="w-16 !bg-white/50 border border-slate-200 rounded-lg focus:ring-0 text-xs font-bold text-slate-800 p-1.5 text-center">
                        <span class="text-xs text-slate-400 font-bold">×</span>
                        <input type="number" value="${it.rate || 0}" placeholder="Rate" onchange="updateNWItem('${cat}', ${i}, 'rate', this.value)" class="w-20 !bg-white/50 border border-slate-200 rounded-lg focus:ring-0 text-xs font-bold text-slate-800 p-1.5 text-center">
                    </div>
                `;
                valueUI = `<span class="w-32 text-right font-bold text-slate-800 p-0 h-auto">₹${formatINR(it.value || 0)}</span>`;
            } else {
                valueUI = `
                    <div class="flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <span class="text-slate-400 font-bold text-xs">₹</span>
                        <input type="number" value="${it.value}" onchange="updateNWItem('${cat}', ${i}, 'value', this.value)" class="w-28 !bg-transparent border-none focus:ring-0 text-right font-bold text-slate-800 p-0 h-auto">
                    </div>
                `;
            }
            
            const toggleIcon = it.isWeightBased ? 
                `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>` : 
                `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>`;

            weightRateUI = `
                <button title="Toggle Weight/Rate Calc" onclick="updateNWItem('${cat}', ${i}, 'isWeightBased', ${!it.isWeightBased})" class="text-slate-400 hover:text-indigo-500 p-1.5 bg-white/50 rounded-lg border border-slate-200 mr-2 transition-colors">
                    ${toggleIcon}
                </button>
                ${weightRateUI}
            `;
        } else {
            valueUI = `
                <div class="flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span class="text-slate-400 font-bold text-xs">₹</span>
                    <input type="number" value="${it.value}" onchange="updateNWItem('${cat}', ${i}, 'value', this.value)" class="w-32 !bg-transparent border-none focus:ring-0 text-right font-bold text-slate-800 p-0 h-auto">
                </div>
            `;
        }

        container.innerHTML += `
            <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-slate-50/80 rounded-2xl group border border-transparent hover:border-slate-200 transition-all shadow-sm hover:shadow-md">
                <div class="flex flex-col flex-1 min-w-[120px]">
                    <input type="text" value="${it.name}" onchange="updateNWItem('${cat}', ${i}, 'name', this.value)" class="!bg-transparent border-none focus:ring-0 font-semibold text-slate-700 p-0 mb-1">
                    ${typeDropdown}
                </div>
                <div class="flex items-center gap-2 ml-auto">
                    ${weightRateUI}
                    ${valueUI}
                    <button onclick="removeNWItem('${cat}', ${i})" class="text-slate-300 hover:text-rose-500 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round"></path></svg>
                    </button>
                </div>
            </div>`;
    });
}

function _getNWArray(cat) {
    if (cat === 'asset') return networthItems.assets;
    if (cat === 'realEstate') {
        if (!networthItems.realEstate) networthItems.realEstate = [];
        return networthItems.realEstate;
    }
    if (cat === 'depreciatable') {
        if (!networthItems.depreciatableAssets) networthItems.depreciatableAssets = [];
        return networthItems.depreciatableAssets;
    }
    return networthItems.liabilities;
}

function updateNWItem(cat, idx, field, value) { 
    const items = _getNWArray(cat);
    if (field === 'value' || field === 'weight' || field === 'rate') {
        items[idx][field] = parseFloat(value) || 0;
    } else if (field === 'isWeightBased') {
        items[idx][field] = value === true || value === 'true';
    } else {
        items[idx][field] = value;
    }

    if (cat === 'asset' && items[idx].isWeightBased) {
        items[idx].value = (items[idx].weight || 0) * (items[idx].rate || 0);
    }
    renderNetWorth(); 
}

function addNWItem(cat) { 
    const items = _getNWArray(cat);
    let defaultType = 'Working Capital';
    if (cat === 'asset') defaultType = 'Frozen Capital';
    if (cat === 'realEstate') defaultType = 'Working Asset';
    if (cat === 'depreciatable') defaultType = 'Depreciatable Asset';

    items.push({ name: 'New Item', value: 0, capitalType: defaultType }); 
    renderNetWorth(); 
}

function removeNWItem(cat, idx) { 
    const items = _getNWArray(cat);
    items.splice(idx, 1); 
    renderNetWorth(); 
}

function updateNWChart(assets, loans) {
    if (charts.nw) charts.nw.destroy();
    charts.nw = new Chart(document.getElementById('chart-nw-ratio'), { 
        type: 'bar', 
        data: { 
            labels: ['Net Worth Mix'], 
            datasets: [
                { label: 'Assets', data: [assets], backgroundColor: '#10b981', borderRadius: 10 }, 
                { label: 'Liabilities', data: [loans], backgroundColor: '#f43f5e', borderRadius: 10 }
            ] 
        }, 
        options: { 
            indexAxis: 'y', 
            scales: { x: { display: false }, y: { display: false } }, 
            plugins: { 
                legend: { display: true, position: 'bottom', labels: { font: { family: 'Outfit' } } }, 
                datalabels: { color: '#fff', font: { weight: 'bold', family: 'Outfit', size: 10 }, formatter: (v) => `₹${formatINR(v)}` } 
            }, 
            maintainAspectRatio: false 
        } 
    });
}

function updateNWAssetCharts(pVal, aVal, rVal, dVal) {
    const typeData = { 'Invested Portfolio': pVal, 'Real Estate': rVal, 'Physical Asset': aVal, 'Depreciatable Asset': dVal };
    
    const labelData = {};
    if (selectedNWHoldingFilter === 'All' || selectedNWHoldingFilter === 'Invested Portfolio') {
        if (pVal > 0) labelData['Invested Portfolio'] = pVal;
    }
    if (selectedNWHoldingFilter === 'All' || selectedNWHoldingFilter === 'Real Estate') {
        (networthItems.realEstate || []).forEach(it => { if(it.value > 0) labelData[it.name] = (labelData[it.name] || 0) + it.value; });
    }
    if (selectedNWHoldingFilter === 'All' || selectedNWHoldingFilter === 'Physical Asset') {
        (networthItems.assets || []).forEach(it => { if(it.value > 0) labelData[it.name] = (labelData[it.name] || 0) + it.value; });
    }
    if (selectedNWHoldingFilter === 'All' || selectedNWHoldingFilter === 'Depreciatable Asset') {
        (networthItems.depreciatableAssets || []).forEach(it => { if(it.value > 0) labelData[it.name] = (labelData[it.name] || 0) + it.value; });
    }

    const chartConfig = { 
        cutout: '75%', 
        plugins: { 
            legend: { display: true, position: 'bottom', labels: { usePointStyle: true, font: { family: 'Outfit', size: 10 } } }, 
            datalabels: { color: '#fff', font: { weight: 'bold', size: 10 }, formatter: (v, ctx) => { const t = ctx.dataset.data.reduce((a, b) => a + b, 0); return (v / t * 100).toFixed(1) + '%'; }, display: (ctx) => (ctx.dataset.data[ctx.dataIndex] / ctx.dataset.data.reduce((a, b) => a + b, 0)) > 0.05 } 
        }, 
        maintainAspectRatio: false 
    };

    if (charts.nwType) charts.nwType.destroy();
    charts.nwType = new Chart(document.getElementById('chart-nw-type'), { 
        type: 'doughnut', 
        data: { 
            labels: Object.keys(typeData).filter(k => typeData[k] > 0), 
            datasets: [{ 
                data: Object.values(typeData).filter(v => v > 0), 
                backgroundColor: Object.keys(typeData).filter(k => typeData[k] > 0).map(k => ASSET_COLORS[k] || ASSET_COLORS.Default), 
                borderWidth: 0 
            }] 
        }, 
        options: {
            ...chartConfig,
            onClick: (event, elements, chart) => {
                if (elements.length > 0) {
                    const idx = elements[0].index;
                    const label = chart.data.labels[idx];
                    applyNWHoldingFilter(label);
                } else {
                    applyNWHoldingFilter('All');
                }
            }
        }
    });

    if (charts.nwLabel) charts.nwLabel.destroy();
    charts.nwLabel = new Chart(document.getElementById('chart-nw-label'), { 
        type: 'doughnut', 
        data: { 
            labels: Object.keys(labelData), 
            datasets: [{ 
                data: Object.values(labelData), 
                backgroundColor: ['#4f46e5', '#0ea5e9', '#2dd4bf', '#a855f7', '#64748b', '#ec4899', '#f97316'], 
                borderWidth: 0 
            }] 
        }, 
        options: chartConfig 
    });
}

function exportData() {
    const data = { 
        portfolio, 
        networthItems, 
        strategy: currentStrategy, 
        customStrategy: STRATEGY_PRESETS.custom,
        history: appHistory, 
        date: new Date().toISOString() 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `Viruthi_Lite_Export.json`; 
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const d = JSON.parse(ev.target.result);
        if (d.portfolio) { 
            portfolio = d.portfolio; 
            networthItems = d.networthItems; 
            appHistory = d.history || [];
            
            if (d.strategy) {
                currentStrategy = d.strategy;
                const select = document.getElementById('strategy-select');
                if (select) select.value = d.strategy;
                
                const customSection = document.getElementById('custom-ratios');
                if (customSection) customSection.classList.toggle('hidden', currentStrategy !== 'custom');
            }
            
            if (d.customStrategy) {
                STRATEGY_PRESETS.custom = d.customStrategy;
                const ce = document.getElementById('custom-equity');
                const cd = document.getElementById('custom-debt');
                const cc = document.getElementById('custom-comm');
                if (ce) ce.value = d.customStrategy.Equity || 50;
                if (cd) cd.value = d.customStrategy.Debt || 30;
                if (cc) cc.value = d.customStrategy.Commodity || 20;
            }
            
            renderPortfolio(); 
        }
    };
    reader.readAsText(e.target.files[0]);
}

function calculateCurrentTotals() {
    const pVal = portfolio.reduce((a, c) => a + c.value, 0);
    const lVal = networthItems.liabilities.reduce((a, c) => a + c.value, 0);
    
    let workingCapital = pVal; 
    let workingAsset = 0;
    let frozenNetWorth = 0;
    let depreciatableAsset = 0;

    const allAssets = [
        ...(networthItems.assets || []),
        ...(networthItems.realEstate || []),
        ...(networthItems.depreciatableAssets || [])
    ];

    allAssets.forEach(item => {
        let cType = item.capitalType;
        if (!cType) {
            if (networthItems.assets && networthItems.assets.includes(item)) cType = 'Frozen Capital';
            else if (networthItems.realEstate && networthItems.realEstate.includes(item)) cType = 'Working Asset';
            else if (networthItems.depreciatableAssets && networthItems.depreciatableAssets.includes(item)) cType = 'Depreciatable Asset';
            else cType = 'Working Capital';
        }

        if (cType === 'Working Capital') workingCapital += item.value;
        else if (cType === 'Working Asset') workingAsset += item.value;
        else if (cType === 'Frozen Capital' || cType === 'Frozen Asset') frozenNetWorth += item.value;
        else if (cType === 'Depreciatable Asset') depreciatableAsset += item.value;
    });

    const trueNetWorth = workingCapital + workingAsset + frozenNetWorth + depreciatableAsset - lVal;
    const fireNetWorth = workingCapital + workingAsset - lVal;

    return {
        date: new Date().toISOString(),
        pVal, trueNetWorth, fireNetWorth, workingCapital, workingAsset, frozenNetWorth, depreciatableAsset
    };
}

function saveToHistory() {
    appHistory.push(calculateCurrentTotals());
    const btn = document.querySelector('button[onclick="saveToHistory()"]');
    if (btn) {
        const oldText = btn.innerText;
        btn.innerText = 'Saved!';
        btn.classList.add('!bg-emerald-50', '!text-emerald-600', '!border-emerald-200');
        setTimeout(() => {
            btn.innerText = oldText;
            btn.classList.remove('!bg-emerald-50', '!text-emerald-600', '!border-emerald-200');
        }, 2000);
    }
    if (!document.getElementById('page-history').classList.contains('hidden')) {
        renderHistory();
    }
}

function aggregateHistoryByMonth() {
    const monthly = {};
    appHistory.forEach(pt => {
        const d = new Date(pt.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthly[key]) {
            monthly[key] = { count: 0, pVal: 0, trueNetWorth: 0, fireNetWorth: 0, workingCapital: 0, workingAsset: 0, frozenNetWorth: 0, depreciatableAsset: 0 };
        }
        monthly[key].count++;
        monthly[key].pVal += pt.pVal;
        monthly[key].trueNetWorth += pt.trueNetWorth;
        monthly[key].fireNetWorth += pt.fireNetWorth;
        monthly[key].workingCapital += pt.workingCapital;
        monthly[key].workingAsset += pt.workingAsset;
        monthly[key].frozenNetWorth += pt.frozenNetWorth;
        monthly[key].depreciatableAsset += pt.depreciatableAsset;
    });

    return Object.keys(monthly).sort().map(key => {
        const m = monthly[key];
        return {
            x: key,
            pVal: m.pVal / m.count,
            trueNetWorth: m.trueNetWorth / m.count,
            fireNetWorth: m.fireNetWorth / m.count,
            workingCapital: m.workingCapital / m.count,
            workingAsset: m.workingAsset / m.count,
            frozenNetWorth: m.frozenNetWorth / m.count,
            depreciatableAsset: m.depreciatableAsset / m.count
        };
    });
}

function getHistoryChartOptions() {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Outfit', size: 10 } } }, datalabels: { display: false } },
        scales: {
            x: { type: 'time', time: { unit: 'month', tooltipFormat: 'MMM yyyy' }, grid: { display: false } },
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => '₹' + (v >= 100000 ? (v/100000).toFixed(1) + 'L' : formatINR(v)) } }
        },
        interaction: { mode: 'index', intersect: false }
    };
}

function renderHistory() {
    const data = aggregateHistoryByMonth();
    
    if (charts.hNetworth) charts.hNetworth.destroy();
    charts.hNetworth = new Chart(document.getElementById('chart-h-networth'), {
        type: 'line',
        data: {
            datasets: [
                { label: 'True Net Worth', data: data.map(d => ({ x: d.x, y: d.trueNetWorth })), borderColor: '#10b981', backgroundColor: '#10b98120', fill: true, tension: 0.4 },
                { label: 'FIRE Net Worth', data: data.map(d => ({ x: d.x, y: d.fireNetWorth })), borderColor: '#3b82f6', backgroundColor: '#3b82f620', fill: true, tension: 0.4 }
            ]
        },
        options: getHistoryChartOptions()
    });

    if (charts.hPortfolio) charts.hPortfolio.destroy();
    charts.hPortfolio = new Chart(document.getElementById('chart-h-portfolio'), {
        type: 'line',
        data: {
            datasets: [
                { label: 'Portfolio Value', data: data.map(d => ({ x: d.x, y: d.pVal })), borderColor: '#8b5cf6', backgroundColor: '#8b5cf620', fill: true, tension: 0.4 }
            ]
        },
        options: getHistoryChartOptions()
    });

    if (charts.hDistribution) charts.hDistribution.destroy();
    charts.hDistribution = new Chart(document.getElementById('chart-h-distribution'), {
        type: 'line',
        data: {
            datasets: [
                { label: 'Working Capital', data: data.map(d => ({ x: d.x, y: d.workingCapital })), borderColor: '#3b82f6', tension: 0.4 },
                { label: 'Working Asset', data: data.map(d => ({ x: d.x, y: d.workingAsset })), borderColor: '#14b8a6', tension: 0.4 },
                { label: 'Frozen Net Worth', data: data.map(d => ({ x: d.x, y: d.frozenNetWorth })), borderColor: '#a855f7', tension: 0.4 },
                { label: 'Depreciatable Asset', data: data.map(d => ({ x: d.x, y: d.depreciatableAsset })), borderColor: '#f97316', tension: 0.4 }
            ]
        },
        options: getHistoryChartOptions()
    });
}

window.onload = () => renderPortfolio();

window.addEventListener('themeChanged', () => {
    if (Object.keys(charts).length > 0) {
        renderPortfolio();
        if (!document.getElementById('page-networth').classList.contains('hidden')) {
            renderNetWorth();
        }
        if (!document.getElementById('page-history').classList.contains('hidden')) {
            renderHistory();
        }
    }
});
