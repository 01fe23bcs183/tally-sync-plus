# Plan 75: Document Attachment & Storage

## Problem Statement
Every voucher should have supporting documents (bills, receipts, contracts) attached. Tally has no document attachment feature. Businesses maintain separate physical or digital files, making audit preparation a nightmare.

## Current Pain Points
- **No attachment in Tally**: Can't attach PDF/image to a voucher
- **Separate filing**: Maintain physical files or folders alongside Tally
- **Audit chaos**: Auditor asks for bill supporting a voucher — hunt through files
- **Lost documents**: Documents get lost, misplaced, or misfiled
- **No search**: Can't search documents by content or metadata

## Proposed Solution
Build a document management system integrated with vouchers and ledgers. Attach documents via upload or camera, auto-link to vouchers, full-text search, and mandatory attachment rules.

## Key Features
1. **Attach to Voucher**: Upload PDF/image and link to specific voucher
2. **Camera Capture**: Take photo of bill directly from mobile
3. **Auto-Link**: OCR to auto-match document with voucher by amount/date
4. **Cloud Storage**: Secure cloud storage with per-company isolation
5. **Full-Text Search**: Search document content using OCR text
6. **Mandatory Rules**: Require attachment for specific voucher types (purchases > ₹10k)
7. **Audit View**: See all vouchers with/without supporting documents


## UI — Easy Mode
Document drop zone on voucher form, thumbnail previews, search by document content, attachment badges


## UI — Tally Mode
Alt+A to attach document to current voucher, F5 to view attachments, document list with voucher links, camera capture


## Implementation Steps
1. Build document upload and storage system
2. Create voucher-document linking UI
3. Implement camera capture for mobile
4. Add OCR for text extraction and auto-matching
5. Build full-text search index
6. Implement mandatory attachment rules engine
7. Create audit compliance view
8. Add bulk upload and auto-matching for backlog

## Priority Level
🟡 **High** — Directly solves audit preparation pain.

## Estimated Effort
3 weeks (1 developer)
