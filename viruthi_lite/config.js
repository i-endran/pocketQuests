// config.js
// Configuration variables and constants for Viruthi Lite

const USD_TO_INR = 83.5;

const ASSET_COLORS = { 
    'Equity': '#6366f1', 
    'Commodity': '#fbbf24', 
    'Debt': '#14b8a6', 
    'Real Estate': '#f43f5e', 
    'Cash': '#10b981', 
    'Physical Asset': '#ec4899',
    'Depreciatable Asset': '#f97316',
    'Invested Portfolio': '#8b5cf6',
    'Default': '#94a3b8' 
};

const STRATEGY_PRESETS = {
    aggressive: { Equity: 70, Debt: 20, Commodity: 10 },
    balanced: { Equity: 50, Debt: 30, Commodity: 20 },
    conservative: { Equity: 30, Debt: 50, Commodity: 20 },
    custom: { Equity: 50, Debt: 30, Commodity: 20 }
};

// Utility function to format Indian Rupee
const formatINR = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
