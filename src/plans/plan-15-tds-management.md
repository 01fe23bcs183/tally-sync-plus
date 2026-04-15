# Plan 15: TDS Management

## Problem Statement
TDS compliance requires tracking deductions, generating challans, and filing quarterly returns — all manually coordinated with Tally data.

## Current Pain Points
- TDS sections and rates must be memorized/looked up
- Threshold tracking (₹30K for contractors, etc.) is manual
- Challan generation requires separate computation
- Form 26Q preparation needs manual data extraction
- TDS certificates (Form 16A) generation is tedious

## Proposed Solution
Automated TDS management with section detection, threshold tracking, challan generation, and return filing assistance.

### Key Features
1. **Auto-Detect Section**: Suggest TDS section based on ledger group/nature of payment
2. **Threshold Tracker**: Track cumulative payments vs TDS threshold per party
3. **Challan Generator**: Compute TDS payable by section, generate challan
4. **Form 26Q**: Auto-prepare quarterly TDS return from Tally data
5. **Certificate Generation**: Generate Form 16A for deductees

## UI Mockup (Easy Mode)
```
┌────────────────────────────────────────────┐
│ TDS Dashboard — Q1 FY 2026-27              │
├────────────────────────────────────────────┤
│ Section     Deducted   Deposited  Pending  │
│ 194C       ₹45,000    ₹30,000    ₹15,000  │
│ 194J       ₹22,000    ₹22,000    ₹0       │
│ 194H       ₹8,500     ₹0         ₹8,500   │
│ 194A       ₹12,000    ₹12,000    ₹0       │
│                                             │
│ ⚠️ Due: Deposit ₹23,500 by 7-May-2026     │
│                                             │
│ [Generate Challan] [Prepare 26Q] [View All]│
└────────────────────────────────────────────┘
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ TDS Deduction                                    │
│──────────────────────────────────────────────────│
│ Party: Professional Services Ltd                 │
│ Section: 194J   Rate: 10%                        │
│ Payment: 1,00,000   TDS: 10,000                 │
│──────────────────────────────────────────────────│
│ TDS Register (Q1):                               │
│ Party              Section  Deducted  Deposited  │
│ Prof Services      194J     30,000    20,000     │
│ Contractor ABC     194C     15,000    15,000     │
│──────────────────────────────────────────────────│
│ F5:Deduct  F7:Challan  F8:26Q  Alt+R:Return      │
└──────────────────────────────────────────────────┘
```
- F5 to create deduction, F7 for challan, F8 for Form 26Q


## Implementation Steps
1. Build TDS section master with rates and thresholds
2. Create threshold tracking per party per section
3. Implement auto-deduction suggestion during voucher entry
4. Build challan computation and generation
5. Create Form 26Q data preparation
6. Generate Form 16A certificates

## Priority Level
🟡 **High** — Quarterly compliance

## Estimated Effort
~8 days
