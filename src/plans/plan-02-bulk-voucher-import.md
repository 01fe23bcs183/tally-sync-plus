# Plan 02: Bulk Voucher Import

## Problem Statement
Businesses often need to import hundreds of vouchers from Excel/CSV (bank statements, sales data from other systems). Tally's native import is XML-only and requires technical knowledge.

## Current Pain Points
- No CSV/Excel import in Tally without third-party tools
- Manual entry of bank transactions is tedious and error-prone
- Accountants spend hours copying data from spreadsheets to Tally
- Mapping columns to Tally fields requires XML expertise
- No preview or validation before import

## Proposed Solution
A drag-and-drop file upload with smart column mapping, data validation, preview, and batch import to Tally via XML.

### Key Features
1. **File Upload**: Drag-drop CSV, Excel (.xlsx), or bank statement PDFs
2. **Smart Column Mapping**: Auto-detect columns (date, amount, party, narration) with manual override
3. **Ledger Matching**: Fuzzy-match imported party names to existing Tally ledgers
4. **Validation Preview**: Show all rows with errors highlighted before import
5. **Batch Processing**: Import in chunks with progress bar and error recovery
6. **Import Templates**: Save mapping configurations for recurring imports

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────────────┐
│ Bulk Import Vouchers                              │
├──────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐             │
│  │  📁 Drop CSV/Excel file here   │             │
│  │     or click to browse         │             │
│  └─────────────────────────────────┘             │
│                                                   │
│  Column Mapping:                                  │
│  File Column    →  Tally Field                   │
│  [Date]         →  [Voucher Date      ▼]         │
│  [Description]  →  [Narration         ▼]         │
│  [Debit]        →  [Amount (Dr)       ▼]         │
│  [Credit]       →  [Amount (Cr)       ▼]         │
│  [Party]        →  [Ledger Name       ▼]         │
│                                                   │
│  Preview (showing 5 of 247 rows):                │
│  ┌──────┬──────────────┬────────┬───────┐       │
│  │ Date │ Party        │ Amount │ Status│       │
│  │ 1-Apr│ Raj Traders  │ 5,000  │ ✅    │       │
│  │ 2-Apr│ XYZ Corp     │ 12,000 │ ⚠️ New│       │
│  │ 3-Apr│ ABC Ltd      │ 800    │ ✅    │       │
│  └──────┴──────────────┴────────┴───────┘       │
│                                                   │
│  [Import All 247 Vouchers]  [Create Missing: 3]  │
└──────────────────────────────────────────────────┘
```

## Data Requirements
- File parsing library (Papa Parse for CSV, SheetJS for Excel)
- Existing ledger list for matching
- Voucher type detection rules
- Import history log

## Tally XML APIs Needed
```xml
<!-- Batch voucher import -->
<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
<REQUESTDATA><TALLYMESSAGE>
<VOUCHER VCHTYPE="Payment" ACTION="Create">
<DATE>20260401</DATE>
<PARTYLEDGERNAME>Raj Traders</PARTYLEDGERNAME>
<AMOUNT>-5000</AMOUNT>
<ALLLEDGERENTRIES.LIST>...</ALLLEDGERENTRIES.LIST>
</VOUCHER>
<!-- ... more vouchers ... -->
</TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>
```


## UI — Tally Mode
```
┌──────────────────────────────────────────────────┐
│ Bulk Import                                      │
│──────────────────────────────────────────────────│
│ File: bank_statement_apr2026.csv                 │
│ Rows: 247 | Valid: 244 | Errors: 3              │
│──────────────────────────────────────────────────│
│ Mapping:                                         │
│  Date        → Voucher Date                      │
│  Description → Narration                         │
│  Debit       → Dr Amount                         │
│  Credit      → Cr Amount                         │
│──────────────────────────────────────────────────│
│ Preview:                                         │
│  01-04-2026  Raj Traders       Dr   5,000  [OK]  │
│  02-04-2026  XYZ Corp          Cr  12,000  [OK]  │
│  03-04-2026  ABC Ltd           Dr     800  [OK]  │
│──────────────────────────────────────────────────│
│ F5:Import  F8:Map  Esc:Cancel  Alt+T:Template    │
└──────────────────────────────────────────────────┘
```
- Keyboard-driven column mapping (Tab to navigate, Enter to select)
- Text-based table preview matching Tally's Day Book format
- F5 to start import, Esc to cancel
- Alt+T to save/load mapping templates
- Status line shows row counts and errors


## Implementation Steps
1. Build file upload component with drag-drop support
2. Integrate Papa Parse (CSV) and SheetJS (Excel) for file parsing
3. Create smart column mapper with auto-detection heuristics
4. Build ledger fuzzy-matching service (Levenshtein distance)
5. Create validation engine (date formats, amount parsing, required fields)
6. Build preview table with inline error display and row editing
7. Implement batch XML generation and chunked import (50 vouchers per request)
8. Add progress tracking with retry on failure
9. Save import templates for recurring use

## Priority Level
🟡 **High** — Major time-saver for accountants

## Estimated Effort
- File parsing & mapping UI: 3 days
- Validation & preview: 2 days
- Batch import engine: 2 days
- Templates & history: 1 day
- Total: ~8 days
