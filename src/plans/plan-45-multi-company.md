# Plan 45: Multi-Company Consolidation

## Problem Statement
Group companies need consolidated financial statements. Tally handles individual companies but consolidation is manual.

## Current Pain Points
- Must open each company separately in Tally
- Consolidated Balance Sheet/P&L requires manual Excel work
- Inter-company transactions need manual elimination
- No group-level dashboard
- Currency conversion for foreign subsidiaries is manual

## Proposed Solution
Multi-company dashboard with consolidated reports, inter-company elimination, and group analytics.

### Key Features
1. **Company Switcher**: Quick switch between connected Tally companies
2. **Consolidated Reports**: Combined Balance Sheet, P&L across companies
3. **Elimination Engine**: Auto-identify and eliminate inter-company transactions
4. **Group Dashboard**: KPIs across all companies in one view
5. **Currency Consolidation**: Convert foreign subsidiary to parent currency

## Implementation Steps
1. Build multi-company connection manager
2. Fetch data from multiple Tally companies
3. Create consolidation engine with group mapping
4. Implement inter-company elimination rules
5. Build group dashboard
6. Add currency conversion for consolidation

## Priority Level
🟡 **Medium**

## Estimated Effort
~10 days
