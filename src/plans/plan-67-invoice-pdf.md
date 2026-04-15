# Plan 67: Invoice PDF Generation & Templates

## Problem Statement
Tally's built-in invoice printing is limited and ugly. Businesses want professional-looking invoices with their branding, but customizing Tally print formats is extremely difficult.

## Current Pain Points
- **Ugly default invoices**: Tally's default format looks outdated
- **Difficult customization**: Tally print format customization requires TDL knowledge
- **No branding**: Hard to add logos, colors, custom layouts
- **No digital signatures**: Paper-based signing process
- **No multi-format**: Can't easily generate PDF, email, WhatsApp-ready formats

## Proposed Solution
Build a professional invoice PDF generation system with customizable templates. Users can design invoices with a drag-drop builder, add branding, terms, digital signatures, and generate in multiple formats.

## Key Features
1. **Template Library**: Pre-built templates (GST Invoice, Proforma, Delivery Challan, Credit Note)
2. **Template Builder**: Drag-drop designer for custom layouts
3. **Branding**: Upload logo, set colors, fonts, add watermarks
4. **Digital Signature**: DSC/image signature on invoices
5. **Multi-Format**: PDF, thermal printer, A4, email-optimized
6. **Batch Generation**: Generate invoices for multiple vouchers at once
7. **Auto-Send**: Generate and email/WhatsApp invoice on voucher save


## UI — Easy Mode
Template gallery with previews, drag-drop template editor, branding panel, batch generate button


## UI — Tally Mode
Alt+P to print/generate PDF from any voucher, F8 to select template, template list with preview, batch print via Ctrl+B


## Implementation Steps
1. Build PDF generation engine (React-PDF or Puppeteer)
2. Create 5+ pre-built invoice templates
3. Build drag-drop template designer
4. Implement branding system (logo, colors, fonts)
5. Add digital signature support
6. Build batch generation queue
7. Integrate with email/WhatsApp sharing (Plan 42)
8. Add thermal printer format support

## Priority Level
🔴 **Critical** — One of the most requested features by Tally users.

## Estimated Effort
3 weeks (1 developer)
