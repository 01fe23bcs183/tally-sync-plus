# Plan 20: Multi-Godown Management

## Problem Statement
Businesses with multiple warehouses/godowns struggle with Tally's basic godown management — no visual stock map, no easy transfers, and limited reorder tracking.

## Current Pain Points
- Godown-wise stock view requires navigating deep menus
- Stock transfers between godowns need manual voucher entry
- No reorder level tracking per godown
- No visual warehouse map or dashboard
- Physical stock verification across godowns is chaotic

## Proposed Solution
Visual multi-godown dashboard with drag-drop transfers, per-godown reorder levels, and location-based stock maps.

### Key Features
1. **Godown Dashboard**: Visual cards/map showing stock levels per location
2. **Quick Transfer**: Drag-drop or one-click stock transfer between godowns
3. **Reorder per Godown**: Set and track minimum levels per godown per item
4. **Transfer History**: Track all inter-godown movements
5. **Stock Verification**: Godown-specific stock count workflow

## Implementation Steps
1. Sync godown masters and godown-wise stock from Tally
2. Build visual godown dashboard with stock summaries
3. Create stock transfer workflow (generates Transfer voucher in Tally)
4. Implement per-godown reorder levels with alerts
5. Build transfer history and analytics

## Priority Level
🟡 **Medium**

## Estimated Effort
~6 days
