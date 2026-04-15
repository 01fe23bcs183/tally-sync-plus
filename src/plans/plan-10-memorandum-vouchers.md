# Plan 10: Memorandum Vouchers

## Problem Statement
Tally's memorandum vouchers (non-accounting entries) are useful for provisional entries but lack a clear conversion workflow and tracking.

## Current Pain Points
- No dashboard to see all pending memorandum vouchers
- Converting to regular voucher requires re-entry in Tally
- No reminder system for pending conversions
- Difficult to track which provisional entries are still outstanding
- No bulk conversion capability

## Proposed Solution
Memorandum voucher dashboard with one-click conversion, reminders, and bulk processing.

### Key Features
1. **Memo Dashboard**: All provisional entries with aging
2. **One-Click Convert**: Convert memo to regular voucher
3. **Bulk Conversion**: Select multiple memos to convert at once
4. **Reminders**: Alert when memos are older than configurable days
5. **Categorization**: Tag memos by purpose (provisional, estimate, pending approval)

## Implementation Steps
1. Fetch memorandum vouchers from Tally
2. Build dashboard with filters and aging
3. Create conversion workflow (memo → regular voucher via XML)
4. Add reminder engine
5. Implement bulk operations

## Priority Level
🟢 **Low**

## Estimated Effort
~4 days
