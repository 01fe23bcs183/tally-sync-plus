# Plan 30: Outstanding Management

## Problem Statement
Managing receivables and payables is one of the biggest pain points. Tally shows outstanding but provides no follow-up tools, reminders, or collection strategies.

## Current Pain Points
- Outstanding reports are static text — no action items
- No automated follow-up reminders
- No customer payment behavior analysis
- Priority of collection calls must be decided manually
- No WhatsApp/email reminder integration

## Proposed Solution
Smart outstanding management with aging analysis, automated reminders, collection priority scoring, and communication tools.

### Key Features
1. **Aging Dashboard**: 30/60/90/120+ day aging with visual charts
2. **Priority Score**: Rank parties by amount, age, and payment history
3. **Auto-Reminders**: Schedule email/WhatsApp reminders based on aging
4. **Payment Promises**: Log follow-up calls and promised payment dates
5. **Collection Efficiency**: Track DSO (Days Sales Outstanding) trend
6. **Payables Calendar**: When do we owe money, cash requirement planning

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────────┐
│ Outstanding Receivables — Total: ₹45.2L      │
├──────────────────────────────────────────────┤
│ Aging: [🟢<30d: ₹15L] [🟡30-60: ₹12L]      │
│        [🟠60-90: ₹10L] [🔴>90d: ₹8.2L]      │
│                                               │
│ Priority Collection List:                     │
│ 1. Mega Corp    ₹8.5L  95 days  Score: 98   │
│ 2. ABC Ltd      ₹5.2L  72 days  Score: 85   │
│ 3. XYZ Trading  ₹4.0L  45 days  Score: 72   │
│                                               │
│ DSO Trend: 42d → 38d → 45d → 52d ⚠️ Rising │
│                                               │
│ [Send Reminders] [Log Follow-up] [Export]     │
└──────────────────────────────────────────────┘
```

## Implementation Steps
1. Fetch outstanding data from Tally (bill-wise)
2. Build aging calculation engine
3. Create priority scoring algorithm
4. Build reminder scheduling system
5. Implement follow-up logging
6. Calculate DSO and collection metrics
7. Add payables calendar view

## Priority Level
🔴 **Critical** — Cash flow impact

## Estimated Effort
~10 days
