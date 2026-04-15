# Plan 42: WhatsApp/SMS Invoice Sharing

## Problem Statement
Sending invoices to customers/vendors currently requires printing, scanning, or attaching PDFs to email. WhatsApp is the preferred communication for most Indian businesses.

## Current Pain Points
- Invoice sharing requires export → attach → email workflow
- No WhatsApp integration for direct sending
- No delivery/read confirmation
- Payment reminders must be sent manually
- No template messages for common communications

## Proposed Solution
One-click invoice sharing via WhatsApp and SMS with templates, delivery tracking, and automated reminders.

### Key Features
1. **WhatsApp Share**: Generate invoice PDF and share via WhatsApp API
2. **SMS Fallback**: Send invoice link via SMS for non-WhatsApp users
3. **Templates**: Pre-formatted messages for invoices, reminders, receipts
4. **Bulk Send**: Send statements/reminders to multiple parties at once
5. **Delivery Tracking**: Know if message was delivered and read
6. **Auto-Reminders**: Schedule payment reminders based on due dates


## UI — Easy Mode
Share button on invoices with WhatsApp/SMS/Email options, contact picker, message preview


## UI — Tally Mode
Alt+W to share via WhatsApp from any invoice, F5 to select format (PDF/image), party mobile number auto-filled


## Implementation Steps
1. Build invoice PDF generator
2. Integrate WhatsApp Business API (or wa.me link for basic)
3. Create message template system
4. Build bulk sending queue
5. Implement delivery tracking (API-based)
6. Create auto-reminder scheduler

## Priority Level
🟡 **High** — Very popular request in India

## Estimated Effort
~8 days
