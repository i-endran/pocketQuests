# 🎒 PocketQuests

Handy micro-tools for daily life. A collection of practical side quest projects that solve real problems with elegance and simplicity.

## About

PocketQuests is a curated library of lightweight utilities designed to add value to everyday tasks. Each quest is a self-contained, focused tool built with modern web technologies and thoughtful UX design.

## Projects

### 🚗 Used Car Valuation Engine
*Active*

Calculate fair market value for used cars in India with detailed depreciation analysis.

**Features:**
- Yearwise depreciation curve visualization
- Mileage impact assessment
- Brand-specific resale value adjustment
- Market guidance (fair deal, acceptable, walk-away thresholds)
- Asking price comparison & negotiation hints

**Location:** `car_depreciation_calc/index.html`

**Try it:** Open the project folder and launch `index.html` in your browser.

### 📈 Viruthi Lite
*Active*

Elegant and dynamic web application for comprehensive asset tracking, portfolio management, and net worth calculation.

**Features:**
- Asset composition & target strategy alignment tracking
- True net worth vs FIRE net worth calculations
- Import / Export JSON capabilities for local data persistence
- Historical growth charts

**Location:** `viruthi_lite/index.html`

**Try it:** Open the project folder and launch `index.html` in your browser.

## Project Structure

```
PocketQuests/
├── index.html                 # Landing page
├── README.md                  # This file
├── assets/
│    └── styles.css            # Shared stylesheet
├── car_depreciation_calc/
│   ├── index.html            # Car valuation tool
│   └── car_depreciation.js   # Car calculator logic
├── viruthi_lite/
│   ├── index.html            # Portfolio manager
│   ├── styles.css            # Styles
│   ├── config.js             # Configuration constants
│   └── scripts.js            # App logic
└── LICENSE
```

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** Dark theme with modern gradients and glassmorphism
- **Charts:** Chart.js for visualization
- **Fonts:** Orbitron (display), Inter (body)

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Browse available projects and click to launch any quest

No build process or dependencies required—everything runs in the browser.

## Design Philosophy

- **Minimal:** No bloat, just what you need
- **Focused:** Each tool solves one problem well
- **Accessible:** Works offline, no external API calls
- **Aesthetic:** Dark theme with smooth interactions

## Contributing

Have an idea for a new micro-utility? Contributions are welcome! Please ensure:
- Tool solves a specific, practical problem
- Clean, maintainable code
- Consistent styling with existing projects
- Self-contained with minimal dependencies

## License

See [LICENSE](LICENSE) file for details.
