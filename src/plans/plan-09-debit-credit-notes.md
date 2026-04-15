# Plan 09: Debit/Credit Note Workflow

## Problem Statement
Creating debit/credit notes in Tally requires manually linking to original invoices and ensuring GST compliance. There's no guided workflow.

## Current Pain Points
- Must manually reference original invoice number
- GST implications (ITC reversal) need manual handling
- No workflow to track note status (draft, approved, submitted)
- Difficult to see all notes linked to an invoice
- No templates for common adjustment scenarios (rate difference, returns, quality issues)

## Proposed Solution
Guided debit/credit note creation linked to original invoices with auto GST adjustment and approval workflow.

### Key Features
1. **Invoice Lookup**: Search and select original invoice to create note against
2. **Reason Templates**: Pre-defined reasons (return, rate difference, damaged, shortage)
3. **Auto GST Adjustment**: Calculate GST reversal/addition automatically
4. **Approval Workflow**: Draft → Review → Approved → Synced to Tally
5. **Linked View**: See all notes against an invoice in one place


## UI — Easy Mode
```
┌──────────────────────────────────────────────────┐
│ New Credit Note                           [Save] │
├──────────────────────────────────────────────────┤
│ Linked Invoice: [INV-218  ▼]  ₹1,50,000         │
│ Party: Raj Traders           Date: 15-Apr-2026   │
│ Reason: [Quality Issue ▼]                        │
│ ┌──────────┬─────┬───────┬────────┐             │
│ │ Item     │ Qty │ Rate  │ Amount │             │
│ │ Widget A │ [5] │ [500] │ 2,500  │             │
│ └──────────┴─────┴───────┴────────┘             │
│ GST Reversal: ₹450 (auto)  Total: ₹2,950       │
│ [Preview]  [Save & Push to Tally]                │
└──────────────────────────────────────────────────┘
```
- Visual invoice picker with search
- Auto-populate items from original invoice
- GST reversal auto-calculated


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Credit Note                  No: CN-005          │
│ Date: 15-Apr-2026  Ref: INV-218                  │
│──────────────────────────────────────────────────│
│ Cr  Raj Traders                      2,950.00   │
│ Dr  Sales Account                    2,500.00   │
│ Dr  CGST Output                       225.00   │
│ Dr  SGST Output                       225.00   │
│──────────────────────────────────────────────────│
│ F2:Date  Alt+L:Link Invoice  F10:Bill Adj        │
└──────────────────────────────────────────────────┘
```
- Alt+L to link with original invoice
- F10 for bill-wise adjustment
- Same keyboard flow as Tally Prime


## Implementation Steps
1. Build invoice search and selection component
2. Create note templates with auto-fill
3. Implement GST auto-calculation for notes
4. Build approval workflow with status tracking
5. Sync approved notes to Tally via XML

## Priority Level
🟡 **High**

## Estimated Effort
~5 days
