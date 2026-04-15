# Plan 69: Cheque Management & PDC Tracking

## Problem Statement
Post-dated cheques (PDCs) are extremely common in Indian business. Tally has basic cheque tracking, but managing hundreds of PDCs, tracking maturity dates, handling bounces, and printing cheques is painful.

## Current Pain Points
- **No PDC calendar**: Can't see which cheques mature when
- **Bounce tracking**: Manual tracking of bounced cheques
- **Cheque printing**: Tally cheque printing is hard to set up
- **No alerts**: Miss cheque maturity dates, forget to deposit
- **Bank-wise view**: Can't quickly see all cheques per bank

## Proposed Solution
Build a complete cheque management system: PDC register, maturity calendar, cheque printing, bounce tracking, bank-wise summary, and maturity alerts.

## Key Features
1. **PDC Register**: All post-dated cheques with status tracking
2. **Maturity Calendar**: Visual calendar showing cheque maturity dates
3. **Cheque Printing**: Print on pre-printed cheque leaves with bank-specific formats
4. **Bounce Management**: Track bounced cheques, reasons, re-presentation
5. **Bank-wise Summary**: All cheques grouped by bank with totals
6. **Maturity Alerts**: Notifications before cheque maturity date
7. **Deposit Tracking**: Track which cheques have been deposited

## UI Mockup (Easy Mode)

```
┌─────────────────────────────────────────────────┐
│  Cheque Management                        — □ × │
├─────────────────────────────────────────────────┤
│  [PDC Register] [Calendar] [Print] [Bank View]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  April 2026                                     │
│  ┌───┬───┬───┬───┬───┬───┬───┐                 │
│  │Mon│Tue│Wed│Thu│Fri│Sat│Sun│                 │
│  ├───┼───┼───┼───┼───┼───┼───┤                 │
│  │   │   │ 1 │ 2 │ 3 │ 4 │ 5 │                 │
│  │   │   │   │₹2L│   │   │   │                 │
│  ├───┼───┼───┼───┼───┼───┼───┤                 │
│  │ 6 │ 7 │ 8 │ 9 │10 │11 │12 │                 │
│  │   │   │₹5L│   │₹1L│   │   │                 │
│  ├───┼───┼───┼───┼───┼───┼───┤                 │
│  │13 │14 │15⬤│16 │17 │18 │19 │                 │
│  │   │   │₹3L│   │   │₹8L│   │                 │
│  └───┴───┴───┴───┴───┴───┴───┘                 │
│                                                 │
│  Today: 3 cheques maturing (₹3,45,000)          │
│  This week: 5 cheques (₹8,20,000)               │
│                                                 │
└─────────────────────────────────────────────────┘
```


## UI — Easy Mode
Cheque calendar with maturity dates, bank-wise tabs, bounce tracking cards, print preview


## UI — Tally Mode
PDC register in Tally format, F5 to add cheque, maturity date list, F7 to mark deposited, bounce entry, Alt+P to print cheque


## Implementation Steps
1. Build PDC register data model and UI
2. Create maturity calendar with cheque visualization
3. Implement cheque printing with customizable formats
4. Build bounce tracking workflow
5. Add bank-wise grouping and summary
6. Implement maturity alert notifications
7. Build deposit tracking and reconciliation
8. Sync cheque data with Tally banking vouchers

## Priority Level
🔴 **Critical** — One of the biggest pain points for Indian businesses using Tally.

## Estimated Effort
3 weeks (1 developer)
