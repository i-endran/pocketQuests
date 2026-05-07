# Viruthi Lite

Viruthi Lite is an elegant and dynamic web application for comprehensive asset tracking, portfolio management, and net worth calculation. It is designed with modern aesthetics and a responsive user interface.

## Features

- **Portfolio Management**: Add, manage, and track your assets across different categories such as Equity, Commodity, Debt, Real Estate, and Cash.
- **Dynamic Dashboard**: Visualizes your asset composition and specific holdings using beautiful, responsive charts.
- **Target Allocation Strategy**: Define your target portfolio distribution (Aggressive, Balanced, Conservative, or Custom) and visually track how aligned your current holdings are against your strategy.
- **Net Worth Tracking**: Keep a close eye on your true net worth by factoring in both physical assets and liabilities.
- **Import / Export**: Seamlessly back up and restore your portfolio data using JSON files.

## Technology Stack

- **HTML5**: Core structure.
- **Tailwind CSS**: Utility-first styling framework for rapid UI design.
- **Vanilla JavaScript**: Lightweight, performant logic for state management and calculations.
- **Chart.js**: Render dynamic doughnut and bar charts to visualize data.

## Getting Started

1. Clone or download the repository to your local machine.
2. Open `index.html` in your web browser. No complex build tools or dev servers are required for local viewing.
3. Manage your assets directly from the browser!

## Project Architecture

- `index.html`: The main entry point, containing the application structure and Tailwind CSS classes.
- `styles.css`: Custom animations and utility classes specific to Viruthi Lite.
- `config.js`: Centralized configuration file containing constants such as the USD to INR conversion rate, asset color mappings, and strategy presets.
- `scripts.js`: The core application logic handling state changes, chart updates, data calculations, and modal toggles.
