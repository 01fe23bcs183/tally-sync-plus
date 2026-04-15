# Plan 01: Smart Voucher Entry

## Problem Statement
Tally users spend excessive time on repetitive voucher entry — manually selecting ledgers, entering same patterns daily, and occasionally creating duplicate entries without realizing it.

## Current Pain Points
- No auto-suggestion for frequently used ledger combinations
- Duplicate vouchers go undetected until manual review
- New users struggle to find the right ledger from thousands
- No learning from past entry patterns
- Switching between voucher types requires navigating menus

## Proposed Solution
An intelligent voucher entry system that learns from historical patterns, auto-suggests ledger combinations, detects duplicates in real-time, and provides a streamlined entry flow.

### Key Features
1. **Pattern Recognition**: Analyze past vouchers to suggest likely Dr/Cr ledger pairs
2. **Auto-Complete**: Type-ahead search with fuzzy matching across all ledgers
3. **Duplicate Detection**: Real-time check against existing vouchers (amount + party + date range)
4. **Quick Templates**: Save common voucher patterns as one-click templates
5. **Smart Defaults**: Auto-fill date, narration prefix, and last-used amounts
6. **Validation Engine**: Real-time balance check, GST rate validation, mandatory field alerts

## UI Mockup (Easy Mode)
```
┌─────────────────────────────────────────────┐
│ New Sales Voucher                    [Save]  │
├─────────────────────────────────────────────┤
│ Date: [15-Apr-2026]  No: [SV-0042]          │
│                                              │
│ Party: [Raj Traders        ▼] ⚡ Suggested  │
│                                              │
│ ┌─ Items ──────────────────────────────────┐ │
│ │ Product     Qty   Rate    GST%   Amount  │ │
│ │ [Widget A]  [10]  [500]   [18%]  [5900]  │ │
│ │ [+ Add Item]                             │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ⚠️ Similar voucher found: SV-0038 (12-Apr)  │
│                                              │
│ Ledger Allocations:                          │
│  Dr: Raj Traders          ₹5,900            │
│  Cr: Sales Account        ₹5,000            │
│  Cr: CGST Output          ₹450              │
│  Cr: SGST Output          ₹450              │
│                                              │
│ Narration: [Sales to Raj Traders - Widgets]  │
└─────────────────────────────────────────────┘
```

## UI Mockup (Tally Mode)
```
┌─────────────────────────────────────────────┐
│ Sales Voucher            No: SV-0042        │
│ Date: 15-Apr-2026                           │
│─────────────────────────────────────────────│
│ Dr  Raj Traders                    5,900.00 │
│ Cr  Sales Account                  5,000.00 │
│ Cr  CGST Output 9%                  450.00  │
│ Cr  SGST Output 9%                  450.00  │
│─────────────────────────────────────────────│
│ Narration: Sales to Raj Traders             │
│                                              │
│ [!] Possible duplicate: SV-0038 (12-Apr)    │
│                                              │
│ F2:Date  F7:Journal  Alt+S:Template         │
└─────────────────────────────────────────────┘
```

## Data Requirements
- Historical voucher data for pattern analysis
- Full ledger master list with groups and GST info
- Stock item catalog with rates and tax categories
- Template storage (localStorage or DB)

## Tally XML APIs Needed
```xml
<!-- Fetch all ledgers -->
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>List of Accounts</REPORTNAME>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>

<!-- Fetch recent vouchers for duplicate check -->
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>Day Book</REPORTNAME>
<STATICVARIABLES><SVFROMDATE>01-04-2026</SVFROMDATE>
<SVTODATE>15-04-2026</SVTODATE></STATICVARIABLES>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>

<!-- Create voucher -->
<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
<REQUESTDATA><TALLYMESSAGE>
<VOUCHER VCHTYPE="Sales" ACTION="Create">...</VOUCHER>
</TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>
```

## Implementation Steps
1. Build voucher entry form component with ledger auto-complete
2. Create pattern analysis service that ranks ledger pairs by frequency
3. Implement duplicate detection algorithm (fuzzy match on amount ± 5%, same party, within 7 days)
4. Add template CRUD (save/load/delete voucher templates)
5. Build validation engine with real-time error/warning display
6. Integrate with Tally XML import for saving vouchers
7. Add keyboard shortcuts matching Tally conventions

## Priority Level
🔴 **Critical** — Core functionality, implement in Phase 2

## Estimated Effort
- Easy Mode UI: 3 days
- Tally Mode UI: 2 days
- Pattern engine: 2 days
- Duplicate detection: 1 day
- Templates: 1 day
- Total: ~9 days
