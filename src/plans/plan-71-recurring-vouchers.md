# Plan 71: Recurring Voucher Automation

## Problem Statement
Many business transactions repeat monthly (rent, salary, insurance, EMI, subscriptions). In Tally, users must create these vouchers manually every month. Forgetting means incomplete books.

## Current Pain Points
- **Monthly manual entry**: Same vouchers created every month
- **Forgotten entries**: Miss recurring entries, books are incomplete
- **No scheduling**: Tally has no native recurring voucher feature
- **Adjustment pain**: If recurring amount changes, must remember to update

## Proposed Solution
Build a recurring voucher system where users define templates with schedules, and the system auto-creates vouchers at defined intervals. Support skip, modify, and preview upcoming entries.

## Key Features
1. **Recurring Templates**: Define voucher template with schedule (daily/weekly/monthly/yearly)
2. **Auto-Create**: System creates vouchers automatically on schedule
3. **Preview**: See upcoming scheduled entries in a calendar view
4. **Skip/Modify**: Skip specific occurrences or modify amounts
5. **Approval Workflow**: Optional approval before auto-creation
6. **End Date/Count**: Set end date or max number of occurrences

## Implementation Steps
1. Build recurring template data model
2. Create scheduler engine (cron-like for voucher creation)
3. Build template management UI
4. Implement calendar preview of upcoming entries
5. Add skip/modify workflow
6. Build approval queue for auto-created vouchers
7. Push created vouchers to Tally via XML API
8. Add notification for created/failed recurring entries

## Priority Level
🟡 **High** — Saves significant time for regular transactions.

## Estimated Effort
2 weeks (1 developer)
