# Plan 11: GST Return Filing

## Problem Statement
Generating GST returns from Tally data requires exporting, reformatting, and manually uploading to the GST portal. Errors in data cause rejection and penalties.

## Current Pain Points
- GSTR-1 and GSTR-3B preparation is manual and time-consuming
- Data format mismatches between Tally and GST portal
- HSN summary generation requires manual compilation
- Invoice-level validation for GST compliance is absent
- No pre-filing error check (missing GSTIN, wrong tax rates, etc.)

## Proposed Solution
Auto-generate GSTR-1, GSTR-3B, and GSTR-9 from Tally data with validation, error detection, and direct JSON export for portal upload.

### Key Features
1. **GSTR-1 Generator**: B2B, B2C Large, B2C Small, Credit/Debit Notes, HSN Summary, Document Summary
2. **GSTR-3B Generator**: Tax liability, ITC, exempt/non-GST supplies
3. **Pre-Filing Validation**: Check for missing GSTIN, invalid HSN, wrong tax rates, threshold violations
4. **Error Dashboard**: List all issues with one-click fix suggestions
5. **JSON Export**: Generate GST portal-compatible JSON for upload
6. **Filing History**: Track return filing status and amendments

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────────┐
│ GST Returns — April 2026                      │
├──────────────────────────────────────────────┤
│ GSTR-1 Status: Ready ✅                       │
│ ┌────────────────────────┬────────┬─────────┐│
│ │ Section                │ Count  │ Value   ││
│ │ B2B Invoices           │ 145    │ ₹28.5L  ││
│ │ B2C Large              │ 12     │ ₹3.2L   ││
│ │ B2C Small              │ 890    │ ₹15.8L  ││
│ │ Credit Notes           │ 8      │ ₹1.2L   ││
│ │ HSN Summary            │ 45 HSN │ ₹47.5L  ││
│ └────────────────────────┴────────┴─────────┘│
│                                               │
│ Validation: 3 warnings ⚠️  0 errors ✅       │
│ - 2 invoices missing buyer GSTIN              │
│ - 1 invoice with non-standard HSN code        │
│                                               │
│ [Fix Issues] [Preview JSON] [Download JSON]   │
│                                               │
│ GSTR-3B Summary:                              │
│ Output Tax: ₹8,55,000 | ITC: ₹6,20,000      │
│ Net Payable: ₹2,35,000                        │
│ [Generate GSTR-3B]                            │
└──────────────────────────────────────────────┘
```

## Tally XML APIs Needed
```xml
<!-- Fetch GST-classified vouchers -->
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>GSTR1</REPORTNAME>
<STATICVARIABLES>
<SVFROMDATE>01-04-2026</SVFROMDATE>
<SVTODATE>30-04-2026</SVTODATE>
</STATICVARIABLES>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ GST Return: GSTR-1    Period: Apr 2026           │
│──────────────────────────────────────────────────│
│ Section          Invoices    Taxable    Tax      │
│──────────────────────────────────────────────────│
│ B2B              45          18,50,000  3,33,000 │
│ B2C (Large)      12           4,20,000    75,600 │
│ B2C (Others)     128          8,60,000  1,54,800 │
│ Credit/Debit     5              45,000    8,100  │
│ Exports          3            2,10,000        0  │
│──────────────────────────────────────────────────│
│ Total            193         33,85,000  5,71,500 │
│ F5:Generate  F8:Validate  Alt+F:File  Ctrl+E:Exp │
└──────────────────────────────────────────────────┘
```
- Tally-style tabular GSTR summary
- F5 to generate, F8 to validate, Alt+F to file


## Implementation Steps
1. Fetch GST voucher data from Tally
2. Build GSTR-1 section classifier (B2B, B2CS, etc.)
3. Create HSN summary aggregator
4. Implement validation engine (100+ rules)
5. Build error dashboard with fix suggestions
6. Generate GST portal JSON format
7. Add GSTR-3B computation
8. Build filing history tracker

## Priority Level
🔴 **Critical** — Monthly compliance requirement

## Estimated Effort
~12 days
