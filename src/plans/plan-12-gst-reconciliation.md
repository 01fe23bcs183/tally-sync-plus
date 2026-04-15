# Plan 12: GST Reconciliation

## Problem Statement
Reconciling purchase data in Tally with GSTR-2A/2B data from the GST portal is a nightmare — manual comparison of thousands of invoices.

## Current Pain Points
- Must download GSTR-2A/2B from portal and compare manually with Tally
- Mismatches in invoice number format, date, or amount cause ITC issues
- No automated matching algorithm
- Tax period differences (invoice vs filing date) cause confusion
- No clear action items for mismatched entries

## Proposed Solution
Upload GSTR-2A/2B JSON, auto-reconcile with Tally purchases, and generate actionable mismatch reports.

### Key Features
1. **Import GSTR-2A/2B**: Upload JSON from GST portal
2. **Auto-Reconcile**: Match by GSTIN + invoice number + amount (with tolerance)
3. **Mismatch Categories**: Matched, Amount Mismatch, Missing in Tally, Missing in GSTR-2A
4. **Action Items**: Suggest corrections for each mismatch
5. **ITC Impact**: Show eligible vs ineligible ITC based on reconciliation

## UI Mockup (Easy Mode)
```
┌─────────────────────────────────────────────────┐
│ GST Reconciliation — April 2026                  │
├─────────────────────────────────────────────────┤
│ GSTR-2B: 234 invoices | Tally Purchases: 228    │
│                                                  │
│ [🟢 Matched: 210] [🟡 Amount Diff: 8]           │
│ [🔴 Missing in Tally: 12] [🟠 Missing in 2B: 4]│
│                                                  │
│ ITC Summary:                                     │
│ Eligible ITC (Matched):     ₹6,20,000           │
│ At Risk ITC (Mismatched):   ₹85,000             │
│ Ineligible ITC (Not in 2B): ₹32,000             │
│                                                  │
│ [View Mismatches] [Export Report] [Auto-Fix]     │
└─────────────────────────────────────────────────┘
```

## Implementation Steps
1. Build GSTR-2A/2B JSON parser
2. Fetch purchase vouchers from Tally
3. Create reconciliation engine (fuzzy matching on invoice numbers)
4. Build mismatch dashboard with categorization
5. Implement action suggestions and auto-fix where possible
6. Generate reconciliation report

## Priority Level
🔴 **Critical** — ITC depends on this

## Estimated Effort
~8 days
