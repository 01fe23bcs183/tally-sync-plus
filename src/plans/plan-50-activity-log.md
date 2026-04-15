# Plan 50: Activity Log & Audit

## Problem Statement
In multi-user environments, knowing who did what and when is critical for accountability. Tally's audit trail is limited and hard to review.

## Current Pain Points
- No easy way to see who created/modified a voucher (in the app)
- Activity log requires Tally's built-in audit which is cumbersome
- No filtering by user, action type, or time range
- No rollback capability from activity log
- No exportable audit report for management

## Proposed Solution
Comprehensive activity logging with user attribution, filtering, rollback, and exportable reports.

### Key Features
1. **Auto-Log**: Record every create, update, delete action with user and timestamp
2. **Activity Feed**: Real-time feed showing latest actions (like GitHub activity)
3. **Filters**: By user, action type, module, date range
4. **Rollback**: Revert any action from the log (where possible)
5. **Export**: Generate audit report for management/auditors
6. **Analytics**: Most active users, peak hours, action distribution

## UI Mockup
```
┌──────────────────────────────────────────────┐
│ Activity Log                    [Export PDF]  │
├──────────────────────────────────────────────┤
│ Filter: [All Users ▼] [All Actions ▼] [Apr] │
│                                               │
│ 🕐 2 min ago — Amit created Sales SV-042     │
│ 🕐 15 min ago — Priya modified Raj Traders   │
│ 🕐 1 hr ago — Amit deleted draft voucher     │
│ 🕐 2 hr ago — System synced 145 vouchers     │
│ 🕐 3 hr ago — Priya ran GSTR-1 report       │
│                                               │
│ [Load More]                                   │
└──────────────────────────────────────────────┘
```


## UI — Easy Mode
Activity timeline feed, user avatar + action cards, filter sidebar, export button


## UI — Tally Mode
Activity register in Tally format, F5 for entry details, F7 to filter by user/date, Alt+P to print log, chronological list


## Implementation Steps
1. Create activity log data model
2. Implement logging hooks for all state-changing operations
3. Build activity feed UI
4. Add filtering and search
5. Implement rollback capability
6. Create export engine (PDF/Excel)
7. Build usage analytics dashboard

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
