# Plan 74: Customer/Vendor Portal

## Problem Statement
Customers and vendors constantly call/email to check their outstanding balance, request invoice copies, or dispute entries. Businesses spend hours answering these queries.

## Current Pain Points
- **Constant calls**: "What's my outstanding?" phone calls daily
- **Invoice requests**: "Send me a copy of invoice #1234" emails
- **No self-service**: Parties can't check their own data
- **Dispute resolution**: Arguments about balances with no shared view
- **Payment follow-up**: Manual calls to collect outstanding payments

## Proposed Solution
Build a self-service portal where customers and vendors can log in, view their ledger, download invoices, make payments, and raise disputes — all synced with Tally data.

## Key Features
1. **Party Login**: Secure login for each customer/vendor
2. **Ledger View**: See their own ledger with running balance
3. **Invoice Download**: Download any invoice as PDF
4. **Online Payment**: Pay outstanding via UPI/cards
5. **Dispute System**: Raise disputes on specific entries with comments
6. **Statement Download**: Download account statement for any period


## UI — Easy Mode
Self-service web portal with party login, ledger view, invoice download, payment button, dispute form


## UI — Tally Mode
Party portal is web-only (Easy Mode) — Tally Mode users manage portal settings via admin menu, view portal activity log


## Implementation Steps
1. Build party authentication system (email/phone based)
2. Create party dashboard with ledger view
3. Implement invoice PDF download from voucher data
4. Integrate payment gateway (Plan 43)
5. Build dispute raising and tracking system
6. Add statement download (PDF/Excel)
7. Implement notification system for new invoices/payments
8. Admin view of party portal activity

## Priority Level
🟡 **Medium** — Reduces operational overhead significantly.

## Estimated Effort
4 weeks (1-2 developers)
