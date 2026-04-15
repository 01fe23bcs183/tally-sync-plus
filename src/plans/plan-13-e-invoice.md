# Plan 13: E-Invoice Generation

## Problem Statement
E-invoicing is mandatory for businesses above ₹5 Cr turnover. Generating IRN from Tally requires external tools or manual portal uploads.

## Current Pain Points
- Tally Prime has built-in e-invoice but it's unreliable for many users
- Failed e-invoice generation blocks sales workflow
- No batch e-invoice generation
- QR code on printed invoices sometimes missing
- IRN cancellation workflow is confusing

## Proposed Solution
Reliable e-invoice generation with batch processing, QR code embedding, and clear IRN management.

### Key Features
1. **Auto-Generate IRN**: Generate e-invoice immediately on voucher save
2. **Batch Processing**: Generate IRNs for multiple pending invoices
3. **QR Code Embedding**: Auto-embed QR on invoice print
4. **IRN Management**: View, cancel, amend IRNs with reason tracking
5. **Error Recovery**: Clear error messages with retry and manual fix options

## Implementation Steps
1. Integrate with e-Invoice API (NIC portal)
2. Build batch IRN generation queue
3. Create QR code generator and print template
4. Build IRN management dashboard
5. Implement error handling and retry logic

## Priority Level
🔴 **Critical** — Legal requirement

## Estimated Effort
~8 days
