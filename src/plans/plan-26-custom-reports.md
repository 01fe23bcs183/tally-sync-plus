# Plan 26: Custom Report Builder

## Problem Statement
Tally's reports are fixed-format. Businesses need custom reports combining data from multiple areas but must export to Excel and manipulate manually.

## Current Pain Points
- Cannot create custom report layouts in Tally
- Combining data from different reports requires Excel work
- No saved report templates
- No scheduled report generation
- No sharing/collaboration on reports

## Proposed Solution
Drag-and-drop report builder with data from all Tally modules, save templates, schedule generation, and share via email/link.

### Key Features
1. **Drag-Drop Builder**: Select fields from ledgers, vouchers, stock, etc.
2. **Filters & Grouping**: Date range, party, voucher type, group-by options
3. **Calculations**: Add computed columns (percentage, running total, variance)
4. **Visualizations**: Add charts alongside tabular data
5. **Templates**: Save and reuse report configurations
6. **Scheduling**: Auto-generate reports daily/weekly/monthly
7. **Export**: PDF, Excel, CSV, Email

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────────┐
│ Report Builder                                │
├──────────────────────────────────────────────┤
│ Available Fields    │  Report Canvas          │
│ ☐ Voucher Date     │  ┌──────────────────┐  │
│ ☐ Party Name       │  │ Party  | Amount   │  │
│ ☐ Voucher Type     │  │ ───────┼──────── │  │
│ ☐ Amount           │  │ Raj    | 50,000   │  │
│ ☐ GST Rate         │  │ ABC    | 32,000   │  │
│ ☐ Stock Item       │  │ [+ Add Column]    │  │
│ ☐ Quantity          │  └──────────────────┘  │
│                     │                         │
│ Filters:            │  [📊 Add Chart]        │
│ Date: Apr 2026      │                         │
│ Type: Sales         │  [Save Template]       │
│                     │  [Export ▼] [Schedule]  │
└──────────────────────────────────────────────┘
```

## Implementation Steps
1. Define available field catalog from all Tally data
2. Build drag-drop report designer UI
3. Create query engine to fetch and combine data
4. Implement calculated columns and aggregations
5. Add chart integration
6. Build template save/load system
7. Implement export (PDF via html2pdf, Excel via SheetJS)
8. Add scheduling engine

## Priority Level
🟡 **High** — Huge productivity gain

## Estimated Effort
~12 days
