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


## UI — Easy Mode
```
┌──────────────────────────────────────────────────┐
│ Memorandum Vouchers                              │
├──────────────────────────────────────────────────┤
│ ┌───────┬────────────┬─────────┬───────┬──────┐ │
│ │ Date  │ Party      │ Amount  │ Type  │ Act  │ │
│ │ 10-Apr│ ABC Corp   │ 50,000  │ Sales │ [⟳]  │ │
│ │ 12-Apr│ XYZ Ltd    │ 25,000  │ Purch │ [⟳]  │ │
│ └───────┴────────────┴─────────┴───────┴──────┘ │
│ Pending: 5 vouchers  Total: ₹2,45,000           │
│ [New Memo]  [Convert Selected]  [Convert All]    │
└──────────────────────────────────────────────────┘
```
- One-click convert to regular voucher
- Bulk convert with confirmation dialog


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Memorandum Voucher             No: M-012         │
│ Date: 10-Apr-2026                                │
│──────────────────────────────────────────────────│
│ Dr  ABC Corp                       50,000.00    │
│ Cr  Sales Account                  50,000.00    │
│──────────────────────────────────────────────────│
│ Status: MEMORANDUM (non-accounting)              │
│ F7:Convert  F5:Save  Alt+M:Memo List  Esc:Back   │
└──────────────────────────────────────────────────┘
```
- F7 to convert memo to regular voucher
- Alt+M to view all memorandum vouchers


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
