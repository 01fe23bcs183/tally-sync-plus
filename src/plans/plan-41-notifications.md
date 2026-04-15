# Plan 41: Notification Center

## Problem Statement
Users miss critical events — sync failures, compliance deadlines, stock alerts, overdue payments. No centralized notification system exists.

## Current Pain Points
- Sync errors go unnoticed until data is stale
- GST filing deadlines missed without external reminders
- Stock reaching reorder level not communicated
- No consolidated view of all alerts and actions needed
- No notification preferences

## Proposed Solution
Centralized notification center with categorized alerts, action items, and configurable preferences.

### Key Features
1. **Notification Bell**: Header icon with unread count
2. **Categories**: Sync, Compliance, Stock, Outstanding, System
3. **Action Items**: Clickable notifications that navigate to relevant screen
4. **Priorities**: Critical (red), Warning (yellow), Info (blue)
5. **Preferences**: Configure which notifications to receive
6. **History**: View past notifications with search


## UI — Easy Mode
Bell icon with badge count, notification panel with categories (sync/compliance/stock), mark read/dismiss


## UI — Tally Mode
Alt+N to open notification list, numbered alerts, Enter to view detail, F5 to mark read, categorized by type


## Implementation Steps
1. Create notification store and event system
2. Build notification bell component with dropdown
3. Implement notification generators for each category
4. Build notification preferences UI
5. Add notification history view
6. Integrate with all alert-generating features

## Priority Level
🟡 **Medium**

## Estimated Effort
~5 days
