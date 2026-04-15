# Plan 25: Reorder Alerts

## Problem Statement
Stockouts cause lost sales. Tally has reorder levels but no proactive alerts or auto-PO generation.

## Current Pain Points
- Reorder levels set in Tally but no notification when reached
- Must manually check stock reports to find low-stock items
- No lead time consideration in reorder planning
- No auto-purchase order generation
- No consumption rate analysis for dynamic reorder points

## Proposed Solution
Smart reorder system with alerts, demand forecasting, lead time awareness, and auto-PO suggestions.

### Key Features
1. **Real-time Alerts**: Push notification when stock hits reorder level
2. **Smart Reorder Point**: Calculate based on consumption rate + lead time + safety stock
3. **Auto-PO Draft**: Generate purchase order for low-stock items
4. **Demand Forecasting**: Predict future consumption from historical data
5. **Supplier Auto-Select**: Choose supplier based on best price/delivery history

## Implementation Steps
1. Sync reorder levels and current stock from Tally
2. Build consumption rate calculator from movement data
3. Implement smart reorder point algorithm
4. Create alert system (in-app + optional email)
5. Build auto-PO generation with supplier selection
6. Add demand forecasting model

## Priority Level
🟡 **High**

## Estimated Effort
~7 days
