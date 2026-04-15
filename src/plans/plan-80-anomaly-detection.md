# Plan 80: AI-Powered Anomaly Detection

## Problem Statement
Fraudulent or erroneous transactions often go unnoticed in Tally because there's no automated system to flag unusual patterns. Businesses discover issues only during audits — months or years later.

## Current Pain Points
- **No fraud detection**: Duplicate payments, ghost vendors go unnoticed
- **No pattern analysis**: Can't identify unusual transaction patterns
- **Late discovery**: Errors found only during annual audit
- **Manual review impossible**: Too many transactions to review manually
- **No rules engine**: Can't set up custom business rules for validation

## Proposed Solution
Build an AI-powered anomaly detection system that continuously monitors transactions for unusual patterns. Combine rule-based detection (configurable by user) with ML-based pattern recognition.

## Key Features
1. **Duplicate Detection**: Flag duplicate amounts, narrations, or party entries
2. **Unusual Amounts**: Flag transactions that deviate from normal patterns per ledger
3. **Timing Anomalies**: Transactions at unusual times (holidays, off-hours)
4. **Round Figure Alerts**: Flag suspicious round-figure cash transactions
5. **Missing GST**: Detect transactions that should have GST but don't
6. **Custom Rules**: User-defined rules (e.g., "alert if purchase > ₹5L without PO")
7. **Risk Score**: Each transaction gets a risk score based on combined factors
8. **Fraud Dashboard**: Overview of flagged transactions with drill-down

## UI Mockup (Easy Mode)

```
┌─────────────────────────────────────────────────────┐
│  Anomaly Detection Dashboard                  — □ × │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Risk Summary:  🔴 3 High  🟡 12 Medium  🟢 845 OK │
│                                                     │
│  ┌────────┬───────────────┬──────────┬──────┬─────┐ │
│  │ Risk   │ Description   │ Amount   │ Type │ Act │ │
│  ├────────┼───────────────┼──────────┼──────┼─────┤ │
│  │ 🔴 95  │ Duplicate pay │ ₹2,34,000│ Pymt │ [→] │ │
│  │ 🔴 92  │ Ghost vendor  │ ₹5,60,000│ Purc │ [→] │ │
│  │ 🔴 88  │ Round cash    │₹10,00,000│ Cash │ [→] │ │
│  │ 🟡 72  │ No GST on txn │ ₹45,000 │ Sale │ [→] │ │
│  │ 🟡 65  │ Unusual amount│ ₹8,90,000│ Purc │ [→] │ │
│  └────────┴───────────────┴──────────┴──────┴─────┘ │
│                                                     │
│  [Configure Rules] [Export Report] [Mark Reviewed]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Implementation Steps
1. Build rule engine with configurable conditions
2. Implement duplicate detection (fuzzy matching on amount, party, narration)
3. Build statistical anomaly detection (z-score per ledger)
4. Create timing analysis module
5. Implement GST compliance checker
6. Build risk scoring model (weighted combination of factors)
7. Create anomaly dashboard with drill-down
8. Add ML model training from user feedback (mark as false positive/confirmed)
9. Build custom rule builder UI
10. Implement scheduled scanning and alerting

## Tally XML APIs Needed
- All voucher data for analysis
- Ledger masters for baseline patterns
- GST configuration for compliance checks

## Priority Level
🔴 **Critical** — Unique differentiator, prevents financial losses.

## Estimated Effort
5 weeks (1-2 developers + data scientist)
