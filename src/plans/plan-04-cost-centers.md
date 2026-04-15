# Plan 04: Cost Center Management

## Problem Statement
Tally's cost center allocation is buried in voucher entry and reports are hard to navigate. Businesses can't easily see profitability by department, project, or location.

## Current Pain Points
- Cost center allocation during voucher entry is confusing for new users
- No visual dashboard for cost center performance
- Reports require deep menu navigation
- Cross-cost-center comparisons need manual work
- No drag-drop allocation interface

## Proposed Solution
Visual cost center management with drag-drop allocation, real-time dashboards, and cross-center comparison reports.

### Key Features
1. **Visual Hierarchy**: Tree view of cost center categories and centers
2. **Drag-Drop Allocation**: Allocate amounts across centers visually during voucher entry
3. **Performance Dashboard**: Revenue, expense, and profit per cost center
4. **Comparison View**: Side-by-side center comparison with charts
5. **Budget vs Actual**: Per-center budget tracking

## UI Mockup (Easy Mode)
```
┌────────────────────────────────────────────┐
│ Cost Centers                                │
├────────────────────────────────────────────┤
│ ├─ Departments                              │
│ │  ├─ Sales       Revenue: ₹12L  Exp: ₹8L │
│ │  ├─ Marketing   Revenue: ₹2L   Exp: ₹5L │
│ │  └─ Operations  Revenue: ₹0    Exp: ₹6L │
│ ├─ Projects                                 │
│ │  ├─ Project Alpha   ₹15L / ₹20L budget  │
│ │  └─ Project Beta    ₹8L / ₹10L budget   │
│                                             │
│ [Pie Chart: Expense by Department]          │
│ [Bar Chart: Budget vs Actual by Project]    │
└────────────────────────────────────────────┘
```

## Tally XML APIs Needed
```xml
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>List of Cost Centres</REPORTNAME>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>
```

## Implementation Steps
1. Sync cost center masters from Tally
2. Build tree view component for cost center hierarchy
3. Create allocation UI for voucher entry (split amounts across centers)
4. Build performance dashboard with charts
5. Implement comparison and budget tracking views

## Priority Level
🟡 **Medium** — Valuable for mid-size businesses

## Estimated Effort
~6 days
