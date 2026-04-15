# Plan 24: Stock Aging Analysis

## Problem Statement
Dead stock and slow-moving inventory tie up capital. Tally provides no aging analysis for stock items.

## Current Pain Points
- No visibility into how long stock has been sitting
- Slow-moving items discovered only during physical count
- No data-driven liquidation decisions
- Carrying cost not calculated
- No ABC analysis (by value/movement)

## Proposed Solution
Stock aging dashboard with ABC analysis, carrying cost estimation, and liquidation recommendations.

### Key Features
1. **Aging Buckets**: Stock classified by days since last movement (0-30, 30-60, 60-90, 90+)
2. **ABC Analysis**: Classify items by value (A=top 80%, B=next 15%, C=bottom 5%)
3. **XYZ Analysis**: Classify by demand variability
4. **Carrying Cost**: Estimate holding cost per item
5. **Liquidation Suggestions**: Flag items for discount sale, return to vendor, or write-off
6. **Movement Trends**: Historical movement chart per item

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────────┐
│ Stock Aging Analysis                          │
├──────────────────────────────────────────────┤
│ [Pie: 0-30d: 45% | 30-60d: 25% | 60-90d: 18% | 90+: 12%]│
│                                               │
│ 🔴 Dead Stock (>180 days): 23 items, ₹4.5L   │
│ 🟠 Slow Moving (90-180d): 45 items, ₹8.2L   │
│ 🟡 Normal (30-90d): 120 items, ₹15.8L       │
│ 🟢 Fast Moving (<30d): 89 items, ₹22.1L     │
│                                               │
│ Top Dead Stock Items:                         │
│ Old Widget v1    180+ days   ₹1.2L  [Dispose]│
│ Obsolete Part    240+ days   ₹0.8L  [Dispose]│
└──────────────────────────────────────────────┘
```


## UI — Easy Mode
Heat map of stock age, slow-moving items highlighted in red, interactive charts with drill-down, dead stock alert cards


## UI — Tally Mode
Stock aging analysis report in Tally columnar format, age-wise brackets, F5 for item details, Alt+P to print aging report


## Implementation Steps
1. Fetch stock movement data from Tally
2. Calculate last movement date per item
3. Build aging bucket classification
4. Implement ABC/XYZ analysis
5. Create carrying cost estimation
6. Build dashboard with charts and recommendations

## Priority Level
🟡 **Medium**

## Estimated Effort
~6 days
