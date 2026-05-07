# Viruthi Lite - Test Cases

## 1. UI and Navigation
- **TC1.1**: Verify that clicking the "Portfolio" navigation pill displays the Portfolio page and hides the Net Worth page.
- **TC1.2**: Verify that clicking the "Net Worth" navigation pill displays the Net Worth page and hides the Portfolio page.
- **TC1.3**: Verify that the navigation pills reflect the active state visually (e.g., active background color vs inactive text color).
- **TC1.4**: Verify that the Add Asset modal opens when the "+" button is clicked on the Portfolio page.
- **TC1.5**: Verify that clicking outside the modal or clicking the "Cancel" button closes the modal.

## 2. Portfolio Management
- **TC2.1**: Add a Standard Asset (e.g., Equity in INR): Verify that entering an amount in INR adds it correctly to the list and updates the total portfolio value accurately.
- **TC2.2**: Add a Standard Asset in USD: Verify that entering an amount in USD multiplies it by the configured `USD_TO_INR` rate (default 83.5) and displays the correct INR equivalent.
- **TC2.3**: Add a Commodity Asset: Verify that selecting "Commodity" changes the input fields to "Weight" and "Rate", and calculates the value as `Weight * Rate`.
- **TC2.4**: Delete Asset: Verify that clicking the delete icon next to an asset removes it from the list and dynamically recalculates the portfolio total.
- **TC2.5**: Edit Asset Inline: Verify that changing the value directly in the portfolio inventory table correctly updates the asset, refreshes the total portfolio value, and updates the charts.
- **TC2.6**: Top Asset Class: Verify that the dashboard correctly identifies the asset class with the highest total value.
- **TC2.7**: Specific Holdings Filter (Dropdown): Verify that changing the select dropdown in "Specific Holdings" filters the chart to only show assets of the selected category.
- **TC2.8**: Specific Holdings Filter (Chart Click): Verify that clicking an arc on the "Asset Composition" chart sets the specific holdings filter to that category and updates the dropdown. Clicking empty space resets it to "All".
- **TC2.9**: Dynamic Chart Totals: Verify that the dynamic total amount is displayed in the center of both the Asset Composition and Specific Holdings doughnut charts, updating based on visible data.

## 3. Strategy Alignment
- **TC3.1**: Verify that selecting the "Aggressive" strategy updates the target allocation percentages in the delta chart (70% Equity, 20% Debt, 10% Commodity).
- **TC3.2**: Verify that selecting the "Custom Strategy" displays the custom ratio input fields.
- **TC3.3**: Verify that modifying the custom equity/debt/comm percentages dynamically updates the delta chart and buy/sell recommendations.
- **TC3.4**: Delta Recommendations: Verify that the difference between the current allocation and target allocation triggers correct "Buy" or "Sell" amounts in INR.
- **TC3.5**: Verify the synchronization label correctly switches between "Aligned" and "Out of Sync" if any delta exceeds 5%.
- **TC3.6**: Verify that the Current vs Target alignment bar chart displays the current percentage in the active color (indigo) and the target percentage in the inert color (slate).

## 4. Net Worth Calculation
- **TC4.1**: Verify that adding a new physical asset or real estate property updates the "Total Assets", "True Net Worth", and "FIRE Net Worth" correctly.
- **TC4.2**: Verify that modifying an existing physical asset or real estate property instantly recalculates the totals.
- **TC4.3**: Verify that adding a new liability updates the "Liabilities" and reduces both "True Net Worth" and "FIRE Net Worth".
- **TC4.4**: Verify that deleting an asset, real estate property, or liability accurately recalculates True Net Worth and FIRE Net Worth.
- **TC4.5**: Net Worth Composition Chart: Verify that the "Asset Composition" chart on the Net Worth page accurately reflects the total values of the Invested Portfolio, Real Estate, Physical Assets, and Depreciatable Assets.
- **TC4.6**: Net Worth Specific Holdings Filter: Verify that clicking an arc in the Asset Composition chart filters the Specific Holdings chart to only show items within that category. Clicking an empty area resets it to "All Categories".
- **TC4.7**: Net Worth Chart Totals: Verify that the dynamic total amount is displayed in the center of both the Asset Composition and Specific Holdings doughnut charts, updating based on visible data.
- **TC4.8**: Depreciatable Assets: Verify that adding a new Depreciatable Asset defaults to "Depreciatable Asset" capital type and correctly updates the "Depreciatable Asset" summary and "True Net Worth", but not "FIRE Net Worth".
- **TC4.9**: Physical Asset Weight/Rate: Verify that toggling the weight/rate mode for a Physical Asset reveals weight and rate inputs, and calculates the value dynamically as Weight * Rate.
- **TC4.10**: Capital Types: Verify that changing an item's capital type correctly distributes its value among "Working Capital", "Working Asset", "Frozen Net Worth", and "Depreciatable Asset" summaries.

## 5. History and Growth
- **TC5.1**: History Tab Navigation: Verify that clicking the "History" pill opens the history page and displays the relevant growth charts.
- **TC5.2**: Save to History: Verify that clicking "Save to History" captures the current True Net Worth, FIRE Net Worth, Portfolio Value, and detailed capital distribution.
- **TC5.3**: Visual Feedback: Verify that the "Save to History" button temporarily changes its style to indicate a successful save.
- **TC5.4**: History Graph Data: Verify that saving multiple data points in the same month dynamically updates the history charts with the averaged values.
- **TC5.5**: Graph Interpolation: Verify that the charts properly render and smooth out the data if no history points exist for intervening months.

## 6. Import/Export
- **TC6.1**: Export: Verify that clicking Export downloads a `.json` file containing the correct `portfolio`, `networthItems`, `strategy`, and the newly recorded `history` array.
- **TC6.2**: Import: Verify that uploading a valid JSON configuration overrides the current application state, populates the history array, and updates all UI elements and history charts accordingly.
