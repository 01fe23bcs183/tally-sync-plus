# Plan 27: Cash Flow Forecasting

## Problem Statement
Businesses often face cash flow surprises. Tally provides historical cash flow but no forward-looking predictions.

## Current Pain Points
- No visibility into future cash position
- Receivables and payables due dates not aggregated into a forecast
- No scenario analysis (what-if)
- Seasonal patterns not identified
- Cash crunch situations discovered too late

## Proposed Solution
AI-powered cash flow forecasting with scenario analysis, receivable/payable projections, and early warning system.

### Key Features
1. **30/60/90 Day Forecast**: Projected cash position based on due dates and historical patterns
2. **Receivable Projections**: When will customers likely pay (based on payment history)
3. **Payable Calendar**: Upcoming payments with priority ranking
4. **Scenario Analysis**: What-if scenarios (delayed payments, new expenses)
5. **Trend Detection**: Identify seasonal patterns and anomalies
6. **Early Warning**: Alert when projected cash drops below threshold


## UI — Easy Mode
Interactive cash flow chart with forecast line, scenario toggles, AI confidence bands, monthly projections


## UI — Tally Mode
Cash flow projection table with monthly columns, F5 to recalculate, historical vs projected comparison, Alt+P to print


## Implementation Steps
1. Aggregate receivable/payable due dates from Tally
2. Analyze historical payment patterns per customer
3. Build projection model (weighted average of past behavior)
4. Create interactive forecast chart
5. Implement scenario builder
6. Add alert engine for cash crunch warnings

## Priority Level
🟡 **Medium** — Strategic value

## Estimated Effort
~8 days
