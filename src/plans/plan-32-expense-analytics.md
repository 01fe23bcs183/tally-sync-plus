# Plan 32: Expense Analytics

## Problem Statement
Expense tracking in Tally is ledger-based with no visual breakdown, anomaly detection, or budget comparison.

## Current Pain Points
- No visual expense breakdown by category
- Unusual expenses go unnoticed until audit
- No month-over-month comparison
- Vendor expense concentration analysis missing
- No expense approval workflow

## Proposed Solution
Visual expense analytics with category breakdown, anomaly detection, vendor analysis, and budget comparison.

### Key Features
1. **Expense Breakdown**: Category-wise pie/treemap charts
2. **Anomaly Detection**: Flag unusual spikes in any category
3. **MoM Comparison**: Month-over-month trend per category
4. **Vendor Analysis**: Top vendors, concentration risk
5. **Budget vs Actual**: Per-category budget tracking
6. **Drill-Down**: Click category → see individual transactions

## Implementation Steps
1. Classify expense vouchers by category (ledger group based)
2. Build category breakdown charts
3. Implement anomaly detection (statistical deviation)
4. Create trend comparison views
5. Build vendor concentration analysis
6. Add budget overlay

## Priority Level
🟡 **Medium**

## Estimated Effort
~6 days
