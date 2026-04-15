# Plan 19: Batch & Expiry Tracking

## Problem Statement
Pharmaceutical, food, and chemical businesses need batch tracking with expiry management. Tally supports batches but the UX is poor and expiry alerts are absent.

## Current Pain Points
- Batch selection during voucher entry is confusing
- No expiry alerts — expired stock gets sold accidentally
- FIFO/FEFO enforcement is manual
- Batch-wise profitability analysis not available
- No visual dashboard for approaching expiry

## Proposed Solution
Visual batch management with expiry alerts, automatic FIFO/FEFO enforcement, and batch-wise analytics.

### Key Features
1. **Expiry Dashboard**: Calendar view of approaching expiry dates
2. **Auto-FEFO**: Automatically suggest oldest expiry batch first during sales
3. **Expiry Alerts**: Configurable alerts (30/60/90 days before expiry)
4. **Batch Profitability**: Track purchase cost vs selling price per batch
5. **Expired Stock Report**: List all expired items with disposal suggestions
6. **QR Batch Labels**: Generate labels with batch number, mfg date, expiry

## UI Mockup (Easy Mode)
```
┌────────────────────────────────────────────┐
│ Batch & Expiry Tracker                      │
├────────────────────────────────────────────┤
│ ⚠️ Expiring in 30 days: 12 batches         │
│ 🔴 Already Expired: 3 batches              │
│                                             │
│ Item       Batch   Qty   Expiry     Status  │
│ Paracetamol B-101  500   20-Apr-26  🔴 5d  │
│ Amoxicillin B-205  200   10-May-26  🟡 25d │
│ Vitamin-C   B-089  1000  15-Jun-26  🟢 61d │
│                                             │
│ [View Expired] [FEFO Report] [Print Labels] │
└────────────────────────────────────────────┘
```


## UI — Easy Mode
Color-coded expiry timeline (green=fresh, yellow=expiring, red=expired), batch selection cards, FIFO/FEFO visual indicators


## UI — Tally Mode
Batch-wise stock report in tabular format, F5 to select batch during voucher entry, FEFO order display, expiry alert list


## Implementation Steps
1. Sync batch details from Tally stock items
2. Build expiry dashboard with calendar view
3. Create alert engine (configurable thresholds)
4. Implement FEFO suggestion during voucher entry
5. Build batch-wise profitability reports
6. Generate batch labels

## Priority Level
🟡 **High** — Critical for pharma/food industries

## Estimated Effort
~7 days
