# Plan 72: Cash & Bank Book with Reconciliation

## Problem Statement
Tally's cash and bank book views are text-based and hard to navigate. Bank reconciliation requires matching statement entries manually. The UI hasn't evolved in decades.

## Current Pain Points
- **Text-only view**: No visual representation of cash flow
- **Manual matching**: Match bank statement entries one by one
- **No drag-drop**: Can't drag a statement entry to match a voucher
- **Running balance confusion**: Hard to track running balance visually
- **No auto-suggestions**: System doesn't suggest matches

## Proposed Solution
Build a modern visual cash book and bank book with running balance charts, drag-drop bank statement matching, auto-suggest matches, and reconciliation reports.

## Key Features
1. **Visual Cash Book**: Timeline view with running balance chart
2. **Bank Book**: Per-bank view with balance tracking
3. **Statement Import**: Upload bank statement (CSV/PDF/OFX)
4. **Auto-Match**: AI suggests matches between statement and vouchers
5. **Drag-Drop Match**: Manually drag statement entry to voucher to match
6. **Reconciliation Report**: Show matched, unmatched, discrepancies


## UI — Easy Mode
Visual cash book with running balance chart, drag-drop bank matching, reconciliation summary


## UI — Tally Mode
Cash/Bank book in Tally's register format, running balance column, F5 to reconcile, bank date entry for BRS


## Implementation Steps
1. Build visual cash book component with chart
2. Create bank book with per-bank filtering
3. Implement bank statement parser (CSV, PDF, OFX formats)
4. Build auto-matching algorithm (amount, date, narration)
5. Implement drag-drop matching UI
6. Create reconciliation report generator
7. Sync reconciliation status back to Tally
8. Add quick entry for unmatched statement items

## Priority Level
🟡 **High** — Solves daily pain for accountants.

## Estimated Effort
3 weeks (1 developer)
