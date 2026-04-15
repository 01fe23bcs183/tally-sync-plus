# Plan 22: Purchase Order Management

## Problem Statement
Tally's purchase order tracking is minimal — no visual pipeline, no fulfillment tracking, and no conversion to invoice workflow.

## Current Pain Points
- Purchase orders are just text entries with no lifecycle tracking
- No visual status (open, partial, fulfilled, cancelled)
- Converting PO to purchase invoice requires re-entry
- No vendor performance tracking (delivery time, quality)
- No approval workflow for POs

## Proposed Solution
Full PO lifecycle management with approval workflow, fulfillment tracking, and one-click conversion to purchase voucher.

### Key Features
1. **PO Pipeline**: Visual board (Kanban) of PO stages
2. **Approval Workflow**: Draft → Approved → Sent → Received → Invoiced
3. **One-Click Conversion**: Convert PO to Purchase voucher with pre-filled data
4. **Partial Receipt**: Track partial deliveries against PO
5. **Vendor Scorecard**: Track delivery performance per supplier

## Implementation Steps
1. Sync purchase orders from Tally
2. Build Kanban pipeline view
3. Create approval workflow
4. Implement PO to purchase voucher conversion
5. Build partial receipt tracking
6. Create vendor performance dashboard

## Priority Level
🟡 **High**

## Estimated Effort
~8 days
