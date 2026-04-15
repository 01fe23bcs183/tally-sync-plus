# Plan 05: Budget Management

## Problem Statement
Tally's budgeting feature is minimal — no alerts, no visual tracking, and comparing budget vs actuals requires navigating deep report menus.

## Current Pain Points
- Budget creation in Tally is tedious (ledger by ledger)
- No real-time alerts when budget is exceeded
- Budget vs actual reports are text-only and hard to read
- No monthly/quarterly budget breakdown
- Cannot import budgets from Excel

## Proposed Solution
Visual budget builder with period-wise breakdown, real-time tracking gauges, overspend alerts, and Excel import/export.

### Key Features
1. **Budget Builder**: Create budgets by group/ledger with monthly breakdown
2. **Visual Tracking**: Gauge charts showing utilization percentage
3. **Alerts**: Push notification when spending reaches 80%, 90%, 100% of budget
4. **Variance Analysis**: Detailed breakdown of over/under spending
5. **Excel Import**: Upload budget from Excel spreadsheet

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────┐
│ Budget Tracker — FY 2025-26              │
├──────────────────────────────────────────┤
│ Overall: ₹45L spent of ₹60L [████░░ 75%]│
│                                           │
│ Category        Budget    Actual   Var%   │
│ Salaries        ₹20L     ₹19.5L   -2%   │
│ Rent            ₹6L      ₹6L       0%   │
│ Marketing       ₹8L      ₹9.2L   +15% ⚠│
│ Travel          ₹4L      ₹5.1L   +28% 🔴│
│ Office Exp      ₹3L      ₹2.8L    -7%   │
│                                           │
│ [Create New Budget] [Import from Excel]   │
└──────────────────────────────────────────┘
```

## Tally XML APIs Needed
```xml
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>List of Budgets</REPORTNAME>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Budget Variance Report         FY 2025-26       │
│──────────────────────────────────────────────────│
│ Particulars       Budget    Actual    Variance   │
│──────────────────────────────────────────────────│
│ Salary Expense   15,00,000 12,50,000  2,50,000  │
│ Rent Expense      6,00,000  5,00,000  1,00,000  │
│ Marketing         8,00,000  4,00,000  4,00,000  │
│ Travel            3,00,000  2,00,000  1,00,000  │
│ Misc Expenses     4,00,000  1,00,000  3,00,000  │
│──────────────────────────────────────────────────│
│ Total            36,00,000 24,50,000 11,50,000  │
│                                                  │
│ F1:Help  F5:Create  F7:Monthly  Alt+P:Print      │
└──────────────────────────────────────────────────┘
```
- Tally-style columnar budget report
- F5 to create/edit budget, F7 for monthly breakdown
- Arrow keys to navigate, Enter to drill into a head
- Alt+P to print, Ctrl+E to export
- Budget groups follow Tally's ledger group hierarchy


## Implementation Steps
1. Sync existing budgets from Tally
2. Build budget creation wizard with period breakdown
3. Create visual dashboard with gauge/progress charts
4. Implement alert engine (threshold-based)
5. Build variance analysis view
6. Add Excel import for budgets

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
