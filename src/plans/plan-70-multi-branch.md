# Plan 70: Multi-Branch Accounting

## Problem Statement
Businesses with multiple branches struggle with Tally because each branch typically runs a separate Tally instance. Consolidating data, inter-branch transactions, and branch comparison is extremely tedious.

## Current Pain Points
- **Separate Tally instances**: Each branch has its own Tally, no unified view
- **Manual consolidation**: Accountant manually combines data from all branches
- **Inter-branch mess**: Transfer between branches requires manual entries on both sides
- **No branch comparison**: Can't compare P&L across branches easily
- **Delayed reports**: Consolidated reports take days to prepare

## Proposed Solution
Build multi-branch accounting with unified data from all branch Tally instances, automated inter-branch transaction matching, consolidated reports, and branch comparison dashboards.

## Key Features
1. **Unified View**: See all branches in one dashboard
2. **Inter-Branch Transactions**: Auto-match and reconcile branch transfers
3. **Consolidated Reports**: Auto-consolidate P&L, Balance Sheet across branches
4. **Branch Comparison**: Side-by-side comparison of branch performance
5. **Branch Hierarchy**: Group branches by region, zone, or custom hierarchy
6. **Elimination Entries**: Auto-generate consolidation elimination entries


## UI — Easy Mode
Branch selector tabs, consolidated dashboard, inter-branch flow diagram, comparison charts


## UI — Tally Mode
Alt+F3 to switch branch, consolidated reports with branch columns, inter-branch voucher entry, F7 for branch comparison


## Implementation Steps
1. Multi-branch data model with branch tagging
2. Connect multiple Tally instances (via multi-instance agent, Plan 54)
3. Build inter-branch transaction matching engine
4. Implement consolidated report generator
5. Create branch comparison dashboard
6. Build branch hierarchy management
7. Implement elimination entry automation
8. Branch-wise access control

## Priority Level
🟡 **High** — Critical for multi-location businesses.

## Estimated Effort
4 weeks (1-2 developers)
