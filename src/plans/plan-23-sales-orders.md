# Plan 23: Sales Order Pipeline

## Problem Statement
Sales teams need a clear pipeline view of orders from booking to delivery. Tally's sales order is a basic voucher with no workflow support.

## Current Pain Points
- No visual pipeline of sales orders
- Partial delivery tracking is manual
- No order-to-invoice conversion workflow
- Pending orders are hard to find
- No delivery scheduling

## Proposed Solution
Sales order pipeline with visual tracking, partial delivery management, and automated invoice generation.

### Key Features
1. **Order Pipeline**: Kanban board (New → Confirmed → Processing → Shipped → Delivered → Invoiced)
2. **Partial Delivery**: Split orders into multiple deliveries
3. **Auto-Invoice**: Generate sales voucher from completed delivery
4. **Delivery Schedule**: Calendar view of upcoming deliveries
5. **Order Analytics**: Conversion rate, average fulfillment time

## Implementation Steps
1. Sync sales orders from Tally
2. Build pipeline Kanban view
3. Create partial delivery workflow
4. Implement order-to-invoice conversion
5. Build delivery calendar
6. Create analytics dashboard

## Priority Level
🟡 **High**

## Estimated Effort
~8 days
