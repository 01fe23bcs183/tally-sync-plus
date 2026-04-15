# Plan 18: Barcode/QR Scanning

## Problem Statement
Inventory-heavy businesses need barcode scanning for fast voucher entry and stock takes, but Tally has no built-in barcode support.

## Current Pain Points
- Stock item selection during voucher entry is manual (type and search)
- Physical stock counts require pen-and-paper then manual entry
- No barcode generation for stock items
- Third-party barcode tools don't integrate well with Tally
- Mobile scanning not supported

## Proposed Solution
Browser-based barcode/QR scanning using device camera, barcode generation for stock items, and scan-to-voucher workflow.

### Key Features
1. **Camera Scanning**: Use device camera to scan barcodes/QR codes
2. **Scan-to-Voucher**: Scanned item auto-adds to current voucher with last rate
3. **Stock Take Mode**: Scan items for physical stock count, compare with book stock
4. **Barcode Generator**: Generate and print barcode labels for stock items
5. **Batch Scanning**: Continuous scan mode for rapid entry
6. **Alias Support**: Map external barcodes to Tally stock item names

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────┐
│ Scan Mode — Sales Voucher            │
├──────────────────────────────────────┤
│  ┌──────────────────────┐            │
│  │  📷 Camera Preview   │            │
│  │  [Scanning...]       │            │
│  └──────────────────────┘            │
│                                      │
│  Last Scanned: Widget-A (₹500)       │
│                                      │
│  Scanned Items:                      │
│  Widget-A    x3    ₹1,500           │
│  Gadget-B    x1    ₹2,200           │
│  Part-C      x5    ₹750             │
│                     Total: ₹4,450    │
│                                      │
│  [Add to Voucher] [Clear] [Manual]   │
└──────────────────────────────────────┘
```

## Implementation Steps
1. Integrate barcode scanning library (html5-qrcode or quagga2)
2. Build stock item ↔ barcode mapping management
3. Create scan-to-voucher workflow
4. Build stock take mode with variance report
5. Implement barcode label generator (printable)
6. Add batch scanning with audio feedback

## Priority Level
🟡 **High** — Major efficiency gain for retail/warehouse

## Estimated Effort
~8 days
