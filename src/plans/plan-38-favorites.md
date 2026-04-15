# Plan 38: Favorites & Quick Access

## Problem Statement
Frequently used ledgers, reports, and voucher types require navigating menus every time. No bookmarking system exists.

## Current Pain Points
- Must navigate full menu hierarchy for frequently used features
- No quick-access panel for favorite reports
- No pinned ledgers for fast selection
- Recent items list is limited
- No personalized dashboard widgets

## Proposed Solution
Favorites system with pinned items, customizable quick-access bar, and personalized dashboard.

### Key Features
1. **Star/Pin**: Mark any ledger, report, or voucher type as favorite
2. **Quick Access Bar**: Sidebar or top bar showing pinned items
3. **Recent History**: Auto-track last 20 accessed items
4. **Dashboard Widgets**: Add favorite reports as dashboard cards
5. **Keyboard Quick-Launch**: Number keys (1-9) for top favorites


## UI — Easy Mode
Star icons on items, favorites sidebar panel, drag-to-reorder, quick access grid on dashboard


## UI — Tally Mode
Alt+B to bookmark current screen, F3 for favorites list, numbered shortcuts (1-9) for top favorites, Tally Gateway-style menu


## Implementation Steps
1. Build favorites storage (localStorage/DB)
2. Create star/pin UI for all listable items
3. Build quick access bar component
4. Implement recent history tracking
5. Create dashboard widget system
6. Add keyboard quick-launch bindings

## Priority Level
🟢 **Medium**

## Estimated Effort
~4 days
