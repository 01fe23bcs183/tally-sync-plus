# Plan 08: Bill-wise Details

## Problem Statement
Tracking which invoices are paid, partially paid, or outstanding is difficult in Tally's text-based interface. Reconciling payments against specific bills requires navigating multiple screens.

## Current Pain Points
- Bill-wise outstanding view is text-only and cluttered
- Partial payment allocation requires manual bill reference entry
- No visual aging of bills (30/60/90 days)
- Difficult to see payment history for a specific invoice
- No bulk bill adjustment capability

## Proposed Solution
Visual bill management with drag-drop payment matching, aging charts, and automated payment allocation.

### Key Features
1. **Bill Dashboard**: All outstanding bills with aging color codes
2. **Payment Matching**: Drag payment to bill for allocation
3. **Aging Chart**: Visual 30/60/90/120+ day breakdown
4. **Bill History**: Full lifecycle of each bill (created → partial → settled)
5. **Bulk Adjustment**: Select multiple bills and allocate a single payment

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────────┐
│ Outstanding Bills — Raj Traders               │
├──────────────────────────────────────────────┤
│ Aging: [🟢 <30d: ₹5K] [🟡 30-60d: ₹12K]   │
│        [🟠 60-90d: ₹8K] [🔴 >90d: ₹3K]     │
│                                               │
│ Bill       Date     Amount   Paid    Balance  │
│ INV-101   1-Jan    10,000   7,000    3,000 🔴│
│ INV-115   15-Feb   15,000   3,000   12,000 🟡│
│ INV-128   1-Mar    8,000    0        8,000 🟡│
│ INV-140   20-Mar   5,000    0        5,000 🟢│
│                             Total:  28,000    │
│                                               │
│ [Allocate Payment] [Send Reminder] [Export]   │
└──────────────────────────────────────────────┘
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Bill-wise Details: Raj Traders                   │
│──────────────────────────────────────────────────│
│ Ref No      Date        Amount     Pending       │
│──────────────────────────────────────────────────│
│ INV-201     01-Feb-26   1,00,000     45,000      │
│ INV-218     15-Mar-26   1,50,000   1,50,000      │
│ INV-225     01-Apr-26   1,75,000   1,25,000      │
│──────────────────────────────────────────────────│
│ Total Outstanding:                 3,20,000      │
│ Overdue (>30 days):                1,45,000      │
│                                                  │
│ F5:Adjust  F7:New Ref  Alt+P:Print  Esc:Back     │
└──────────────────────────────────────────────────┘
```
- Tally-identical bill reference layout
- F5 to adjust payment against bill, F7 to create new reference
- Arrow keys to navigate bills, Enter for details
- Same bill allocation flow as Tally Prime


## Implementation Steps
1. Sync bill-wise details from Tally vouchers
2. Build aging calculation and color-coded dashboard
3. Create payment allocation UI with drag-drop
4. Implement bulk adjustment workflow
5. Build bill history timeline view
6. Generate aging reports

## Priority Level
🔴 **Critical** — Core accounting need

## Estimated Effort
~7 days
