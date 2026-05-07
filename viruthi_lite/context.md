# Viruthi Lite - AI Context Document

This document provides necessary technical context for an AI agent attempting to modify, scale, or maintain the Viruthi Lite project.

## Project Structure

- `index.html`: The HTML layout featuring Tailwind CSS via CDN.
- `styles.css`: Scoped custom CSS, including animations (`@keyframes fadeIn`) and custom layout utilities (`.curvy-card`, `.nav-pill`).
- `config.js`: All configurables and constants. Modify this file to update colors (`ASSET_COLORS`), strategies (`STRATEGY_PRESETS`), or the `USD_TO_INR` conversion rate.
- `scripts.js`: Main state logic, DOM manipulation, and Chart.js initialization.

## State Management

State is managed via top-level JavaScript let variables in `scripts.js`:
- `portfolio`: An array of objects tracking invested assets. `[{ id, type, label, value }]`
- `networthItems`: An object mapping `assets` and `liabilities` arrays. `{ assets: [], liabilities: [] }`
- `currentStrategy`: A string key mapping to `STRATEGY_PRESETS` in `config.js`.
- `charts`: An object holding instances of Chart.js objects to allow destroying and recreating them on state updates.

## Key Functions

- **`navigate(page)`**: Toggles visibility of top-level sections (`portfolio` vs `networth`).
- **`saveAsset()`**: Reads the modal form, calculates value (especially using `USD_TO_INR` for forex or `weight * price` for commodities), updates the `portfolio` array, and triggers `renderPortfolio()`.
- **`renderPortfolio()` / `renderNetWorth()`**: Clears the relevant DOM containers, iterates through the state arrays to rebuild HTML strings, updates total labels, and invokes chart update functions.
- **`updateCharts()` / `updateDeltaChart()` / `updateNWChart()`**: Destroys previous chart instances and rebuilds them based on the new data maps.
- **`exportData()` / `importData()`**: Serializes the state to JSON and downloads it, or reads a JSON file and overrides the local state.

## Implementation Guidelines

- **Vanilla JS**: No frameworks like React or Vue are used. Direct DOM manipulation is required (e.g., `document.getElementById('...').innerHTML = ...`).
- **Tailwind CSS**: Use Tailwind classes for layout. Custom CSS in `styles.css` should be reserved for complex styling such as hover effects that involve multiple properties or `@keyframes`.
- **API Preparation**: Constants like `USD_TO_INR` are currently hardcoded in `config.js`. If you need to add an external API integration, do it within `config.js` or create an API fetching service in `scripts.js` that overrides the `config.js` default prior to rendering.
