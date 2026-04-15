# Plan 29: Comparative Statements

## Problem Statement
Comparing financial data across periods or companies in Tally requires opening multiple reports and manually noting numbers.

## Current Pain Points
- No side-by-side period comparison in a single view
- Multi-company comparison requires switching companies
- Growth/decline percentages must be calculated manually
- No visual comparison (charts)
- Cannot compare actual vs budget vs previous year simultaneously

## Proposed Solution
Interactive comparative statements with period/company selection, auto-computed variances, and visual comparisons.

### Key Features
1. **Period Comparison**: Select 2-5 periods for side-by-side comparison
2. **Company Comparison**: Compare across companies (multi-company setup)
3. **Auto-Variance**: Percentage and absolute change computation
4. **Visual Bars**: Inline bar charts showing relative sizes
5. **Drill-Down**: Click any number to see underlying vouchers

## Implementation Steps
1. Fetch financial data for multiple periods from Tally
2. Build multi-column comparison table component
3. Add variance computation
4. Create inline visualization
5. Implement drill-down navigation

## Priority Level
🟡 **Medium**

## Estimated Effort
~6 days
