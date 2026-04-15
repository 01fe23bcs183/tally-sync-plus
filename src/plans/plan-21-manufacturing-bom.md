# Plan 21: Manufacturing / Bill of Materials

## Problem Statement
Manufacturing businesses need BOM management, production entry, and wastage tracking. Tally's manufacturing journal is basic and unintuitive.

## Current Pain Points
- BOM setup in Tally is confusing and hidden
- Production voucher entry requires knowing exact component quantities
- No visual BOM tree view
- Wastage tracking is manual
- No production planning based on sales orders

## Proposed Solution
Visual BOM builder, one-click production entries, wastage tracking, and production planning from sales orders.

### Key Features
1. **Visual BOM Builder**: Drag-drop components to create BOMs with tree view
2. **Production Wizard**: Select finished good → auto-calculate components needed
3. **Wastage Tracking**: Record actual vs standard consumption, track variance
4. **Cost Analysis**: Auto-calculate production cost from component prices
5. **Planning**: Link production to pending sales orders

## UI Mockup (Easy Mode)
```
┌────────────────────────────────────────────┐
│ BOM — Finished Widget                       │
├────────────────────────────────────────────┤
│ 📦 Finished Widget (1 unit = ₹850)         │
│ ├── 🔩 Component A  x2  (₹100 ea)         │
│ ├── 🔩 Component B  x1  (₹300)            │
│ ├── ⚙️ Sub-Assembly  x1  (₹250)           │
│ │   ├── 🔩 Part X  x3  (₹50 ea)           │
│ │   └── 🔩 Part Y  x1  (₹100)             │
│ └── 📦 Packaging     x1  (₹50)            │
│                                             │
│ Production Cost: ₹850 | Sell Price: ₹1,200 │
│ Margin: ₹350 (29.2%)                       │
│                                             │
│ [Start Production] [Edit BOM] [Cost Sheet]  │
└────────────────────────────────────────────┘
```


## UI — Easy Mode
Visual BOM tree with nested components, drag-drop assembly, cost breakdown pie chart, production order cards


## UI — Tally Mode
BOM entry screen matching Tally's manufacturing journal, F5 to select BOM, component list with quantities, wastage entry field


## Implementation Steps
1. Sync BOM data from Tally stock items
2. Build visual BOM tree component
3. Create production wizard with component check
4. Implement wastage recording and variance reports
5. Build production cost calculator
6. Link to sales orders for planning

## Priority Level
🟡 **Medium** — For manufacturing businesses

## Estimated Effort
~9 days
