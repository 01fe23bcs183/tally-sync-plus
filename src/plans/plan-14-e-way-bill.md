# Plan 14: E-Way Bill

## Problem Statement
E-Way Bills are required for goods movement above ₹50,000. Managing them alongside invoices in Tally is disjointed.

## Current Pain Points
- E-Way Bill generation requires separate portal login
- Transport details must be entered separately
- Bulk E-Way Bill generation not available in Tally
- Tracking E-Way Bill validity/expiry is manual
- Part-B (vehicle details) update requires portal visit

## Proposed Solution
Integrated E-Way Bill generation from invoices with transport management and validity tracking.

### Key Features
1. **Auto-Generate**: Create E-Way Bill from invoice with one click
2. **Transport Master**: Manage transporters, vehicle numbers
3. **Bulk Generation**: Generate E-Way Bills for multiple invoices
4. **Validity Tracker**: Alert before E-Way Bill expires
5. **Part-B Update**: Update vehicle details without portal visit
6. **Consolidation**: Create consolidated E-Way Bills for multiple invoices to same destination

## Implementation Steps
1. Integrate with E-Way Bill API
2. Build transport master management
3. Create auto-generation from sales vouchers
4. Implement validity tracking and alerts
5. Build consolidated E-Way Bill feature

## Priority Level
🟡 **High** — Compliance for goods movement

## Estimated Effort
~7 days
