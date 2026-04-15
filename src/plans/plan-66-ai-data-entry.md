# Plan 66: Smart Data Entry with AI

## Problem Statement
Manual voucher entry is the biggest time sink for Tally users. Entering the same types of transactions repeatedly, typing narrations, selecting ledgers — it's tedious and error-prone.

## Current Pain Points
- **Manual ledger selection**: Scroll through hundreds of ledgers to find the right one
- **Repetitive narrations**: Type the same narration text every day
- **Invoice data re-entry**: Look at a paper/PDF invoice and type everything manually
- **No learning**: System doesn't learn from past entries
- **Categorization errors**: Wrong ledger selection leads to misclassified expenses

## Proposed Solution
AI-powered data entry that can extract data from invoice images (OCR), auto-suggest ledgers based on patterns, generate narrations, and auto-categorize expenses. The system learns from past entries.

## Key Features
1. **Invoice OCR**: Capture invoice photo → extract party, amount, items, GST, date
2. **Smart Ledger Suggestion**: Based on party name, amount pattern, past entries
3. **Auto-Narration**: Generate narration from context (party, items, amount)
4. **Expense Categorization**: Auto-categorize expenses based on description/vendor
5. **Pattern Learning**: Learn from corrections, improve over time per company
6. **Batch Processing**: Process multiple invoices at once

## UI Mockup (Easy Mode)

```
┌─────────────────────────────────────────────────┐
│  Smart Voucher Entry                      — □ × │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────┐  ┌────────────────────────┐  │
│  │               │  │ Extracted Data:        │  │
│  │  [Drop Image] │  │                        │  │
│  │  or           │  │ Party: Kumar Traders   │  │
│  │  📷 Camera    │  │ Amount: ₹45,230.00     │  │
│  │               │  │ Date: 15-Apr-2026      │  │
│  │  invoice.pdf  │  │ GST: ₹8,141.40        │  │
│  │  ✅ Processed │  │ Items: 3               │  │
│  │               │  │                        │  │
│  └───────────────┘  │ Suggested Ledger:      │  │
│                     │ 📗 Purchase - Trading   │  │
│                     │ (95% confidence)        │  │
│                     │                        │  │
│                     │ Narration:             │  │
│                     │ "Purchase from Kumar   │  │
│                     │  Traders - Inv #1234"  │  │
│                     └────────────────────────┘  │
│                                                 │
│  [✓ Accept & Create Voucher] [✏ Edit] [✗ Skip] │
│                                                 │
└─────────────────────────────────────────────────┘
```


## UI — Easy Mode
Image drop zone with OCR preview, extracted fields with confidence scores, accept/edit/skip buttons


## UI — Tally Mode
Alt+I to activate AI input, paste/scan invoice image, extracted data fills voucher fields, Tab to confirm each field


## Implementation Steps
1. Integrate OCR service (Google Vision API / Tesseract.js)
2. Build invoice data extraction pipeline (regex + AI parsing)
3. Implement ledger suggestion engine (frequency + NLP matching)
4. Build narration generator
5. Create expense categorization model
6. Implement learning feedback loop (corrections → model update)
7. Build batch processing UI
8. Mobile camera integration for photo-to-voucher

## Tally XML APIs Needed
- `<LEDGERNAME>` — fetch all ledgers for suggestion matching
- `<VOUCHERTYPENAME>` — determine voucher type from extracted data
- Voucher creation XML for pushing processed entries

## Priority Level
🔴 **Critical** — Biggest productivity improvement for users.

## Estimated Effort
4 weeks (1 developer + AI/ML integration)
