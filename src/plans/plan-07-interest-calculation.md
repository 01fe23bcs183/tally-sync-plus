# Plan 07: Interest Calculation

## Problem Statement
Calculating interest on outstanding balances (loans, party accounts) in Tally requires manual computation or complex formulas.

## Current Pain Points
- No automatic interest calculation on overdue invoices
- Loan interest tracking requires manual journal entries
- Different interest rates for different parties need manual tracking
- Compound interest calculations are error-prone
- No interest statement generation for parties

## Proposed Solution
Auto-calculate interest on outstanding balances with configurable rates, generate interest vouchers, and send interest statements to parties.

### Key Features
1. **Interest Profiles**: Define rate, type (simple/compound), grace period per party/group
2. **Auto-Calculate**: Compute interest on overdue invoices/bills
3. **Journal Generation**: Auto-create interest journal entries
4. **Interest Statements**: Generate printable/emailable statements for parties
5. **What-If Analysis**: Preview interest impact before posting

## UI Mockup (Easy Mode)
```
┌────────────────────────────────────────────┐
│ Interest Calculator                         │
├────────────────────────────────────────────┤
│ Party: Raj Traders                          │
│ Rate: 18% p.a. (Simple)  Grace: 30 days   │
│                                             │
│ Invoice    Due Date   Overdue  Interest     │
│ INV-101    1-Jan      105 days  ₹2,466     │
│ INV-115    15-Feb     59 days   ₹975       │
│ INV-128    1-Mar      45 days   ₹1,110     │
│                                  ──────     │
│ Total Interest:                  ₹4,551     │
│                                             │
│ [Create Journal Entry] [Send Statement]     │
└────────────────────────────────────────────┘
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Interest Calculation                             │
│ Ledger: Raj Traders    Rate: 12% p.a.           │
│──────────────────────────────────────────────────│
│ Date       Balance      Days    Interest         │
│──────────────────────────────────────────────────│
│ 01-Apr-26  1,50,000.00   30     1,479.45        │
│ 01-May-26  2,00,000.00   31     2,038.36        │
│ 01-Jun-26  1,20,000.00   30     1,183.56        │
│──────────────────────────────────────────────────│
│ Total Interest:                  4,701.37        │
│                                                  │
│ F5:Calculate  F7:Create Vch  Alt+P:Print         │
└──────────────────────────────────────────────────┘
```
- Tally-style tabular display with running balance
- F5 to recalculate, F7 to create interest voucher
- Alt+P to print statement, Ctrl+E to export
- Supports simple/compound interest matching Tally


## Implementation Steps
1. Build interest profile configuration UI
2. Create calculation engine (simple, compound, daily/monthly)
3. Integrate with bill-wise outstanding data
4. Auto-generate journal entries for interest
5. Build statement generator (PDF/print)

## Priority Level
🟡 **Medium**

## Estimated Effort
~5 days
