# Plan 40: Auto-Save & Draft

## Problem Statement
If the browser crashes or user navigates away during voucher entry, all data is lost. Tally has no draft/auto-save.

## Current Pain Points
- Browser crash loses all unsaved work
- Cannot pause voucher entry and resume later
- Complex vouchers take time — risk of data loss increases
- No draft status for incomplete vouchers
- Multiple people cannot collaborate on a draft

## Proposed Solution
Auto-save drafts to localStorage/DB, resume incomplete entries, and manage draft lifecycle.

### Key Features
1. **Auto-Save**: Save form state every 10 seconds to localStorage
2. **Draft Recovery**: On page load, detect and offer to resume drafts
3. **Draft Manager**: View all saved drafts with timestamps
4. **Draft Status**: Show "Draft saved 5s ago" indicator
5. **Submit or Discard**: Clear workflow to finalize or delete drafts

## Implementation Steps
1. Create draft serialization for all voucher types
2. Implement auto-save timer with debouncing
3. Build draft recovery prompt on page load
4. Create draft manager UI
5. Add draft indicator in form header

## Priority Level
🟡 **Medium**

## Estimated Effort
~4 days
