# Plan 77: Dashboard Customization & Widgets

## Problem Statement
Different users need different information at a glance. A CFO wants cash flow, a salesperson wants outstanding, a warehouse manager wants stock levels. One-size-fits-all dashboards don't work.

## Current Pain Points
- **Fixed dashboard**: Everyone sees the same thing
- **No KPI focus**: Can't highlight the metrics that matter to each user
- **No real-time**: Dashboard data is static, needs manual refresh
- **No alerts integration**: Dashboard doesn't show urgent items

## Proposed Solution
Build a drag-drop dashboard builder with a library of widgets. Users can create personalized dashboards with the KPIs, charts, and alerts that matter to them.

## Key Features
1. **Widget Library**: Pre-built widgets (cash balance, outstanding aging, sales chart, stock alerts)
2. **Drag-Drop Layout**: Arrange widgets in customizable grid
3. **Widget Sizing**: Resize widgets (small/medium/large/full-width)
4. **Real-Time Data**: Auto-refresh widgets at configurable intervals
5. **Per-User Dashboards**: Each user saves their own dashboard
6. **Shared Dashboards**: Admin can create and share dashboards with teams
7. **Alert Widgets**: Overdue payments, low stock, compliance deadlines


## UI — Easy Mode
Drag-drop widget grid, widget library sidebar, resize handles, per-user save/load


## UI — Tally Mode
Dashboard managed via Easy Mode — Tally Mode uses classic menu-driven navigation instead of widget dashboard


## Implementation Steps
1. Build dashboard grid system (react-grid-layout)
2. Create widget component architecture (standardized data interface)
3. Build 10+ pre-built widgets
4. Implement drag-drop layout editor
5. Add widget configuration panels
6. Build dashboard save/load per user
7. Implement shared dashboard system
8. Add real-time data refresh

## Priority Level
🟡 **Medium** — Great UX improvement, not blocking.

## Estimated Effort
3 weeks (1 developer)
