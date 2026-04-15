# Plan 06: Bank Reconciliation

## Problem Statement
Bank reconciliation in Tally is manual and painful — users must compare bank statements line by line with Tally entries.

## Current Pain Points
- No bank statement import (CSV/PDF) in Tally
- Manual matching of each transaction
- No auto-matching by amount/date/reference
- Reconciliation status is hard to track
- Unreconciled items are difficult to identify

## Proposed Solution
Upload bank statements, auto-match with Tally entries, handle exceptions with a visual reconciliation interface.

### Key Features
1. **Statement Upload**: CSV, Excel, OFX, PDF bank statement import
2. **Auto-Match**: Match by amount + date + reference number
3. **Manual Match**: Drag-drop unmatched items to pair them
4. **Exception Handling**: Flag unmatched items, create missing entries
5. **Reconciliation Report**: Summary with matched/unmatched/variance

## UI Mockup (Easy Mode)
```
┌───────────────────────────────────────────────┐
│ Bank Reconciliation — HDFC A/c ****1234       │
├───────────────────────────────────────────────┤
│ Bank Statement          │  Tally Books         │
│ 1-Apr  NEFT Raj  5,000 │  1-Apr Payment 5,000 │ ✅
│ 2-Apr  ATM       2,000 │  (no match)          │ ❌
│ 3-Apr  UPI ABC   1,500 │  3-Apr Receipt 1,500 │ ✅
│ (no match)              │  4-Apr Journal 800   │ ❌
│                                                │
│ Summary: 45 matched | 3 bank-only | 2 book-only│
│ Bank Balance: ₹2,45,000  Book Balance: ₹2,42,200│
│ Difference: ₹2,800                             │
│                                                │
│ [Reconcile Matched] [Create Missing Entries]   │
└───────────────────────────────────────────────┘
```

## Tally XML APIs Needed
```xml
<!-- Fetch bank ledger transactions -->
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>Ledger Vouchers</REPORTNAME>
<STATICVARIABLES>
<LEDGERNAME>HDFC Bank</LEDGERNAME>
</STATICVARIABLES>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Bank Reconciliation Statement                    │
│ Bank: Bank of India    Period: Apr 2026          │
│──────────────────────────────────────────────────│
│ Date     Particulars      Debit    Credit  BkDt  │
│──────────────────────────────────────────────────│
│ 01-Apr   Raj Traders              5,000   01-Apr │
│ 03-Apr   Rent Payment    25,000           03-Apr │
│ 04-Apr   Receipt-R002             8,500   05-Apr │
│ 08-Apr   Salary          50,000           [    ] │
│──────────────────────────────────────────────────│
│ Balance as per Books:    8,75,000                │
│ Balance as per Bank:     8,62,500                │
│ Difference:                12,500                │
│                                                  │
│ F5:Reconcile  F2:Date  Alt+A:Auto  Esc:Back      │
└──────────────────────────────────────────────────┘
```
- Tally-identical BRS layout with bank date column
- Enter bank date to mark as reconciled
- F5 to reconcile selected, Alt+A to auto-fill dates
- Arrow keys to navigate, same flow as Tally Prime BRS
- Shows balance difference at bottom


## Implementation Steps
1. Build bank statement parser (CSV, Excel, PDF via OCR)
2. Create auto-matching algorithm (amount ± tolerance, date ± 3 days, reference)
3. Build side-by-side reconciliation UI with drag-drop
4. Implement exception workflow (create missing entries in Tally)
5. Generate reconciliation report (BRS)
6. Track reconciliation history

## Priority Level
🔴 **Critical** — #1 pain point for accountants

## Estimated Effort
~10 days
