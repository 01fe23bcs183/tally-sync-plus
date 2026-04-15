# Plan 16: TCS Compliance

## Problem Statement
Tax Collected at Source (TCS) rules are complex with multiple sections and thresholds. Tally users often miss TCS collection leading to penalties.

## Current Pain Points
- TCS applicability rules are complex (scrap, minerals, motor vehicles, etc.)
- Threshold tracking (₹50L for sale of goods) requires manual monitoring
- TCS on sale of goods above ₹50L (Section 206C(1H)) is frequently missed
- No automated TCS computation during invoicing
- TCS return preparation is manual

## Proposed Solution
Auto-detect TCS applicability, compute and add TCS to invoices, track thresholds, and prepare TCS returns.

### Key Features
1. **Auto-Detection**: Flag transactions requiring TCS based on nature and threshold
2. **Threshold Monitoring**: Track cumulative sales per buyer for 206C(1H)
3. **Invoice Integration**: Auto-add TCS line item to qualifying invoices
4. **Return Preparation**: Generate data for TCS quarterly return
5. **Compliance Dashboard**: Overview of TCS collected, deposited, pending

## Implementation Steps
1. Build TCS section master with rules and thresholds
2. Create buyer-wise cumulative tracking
3. Integrate TCS auto-computation in voucher entry
4. Build compliance dashboard
5. Create return data generator

## Priority Level
🟡 **Medium**

## Estimated Effort
~5 days
