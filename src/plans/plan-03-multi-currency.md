# Plan 03: Multi-Currency Support

## Problem Statement
Businesses dealing in foreign currencies struggle with Tally's multi-currency setup — manual rate entry, no live forex rates, and complex gain/loss calculations.

## Current Pain Points
- Must manually enter exchange rates for every transaction
- No auto-fetch of live forex rates
- Realized/unrealized gain/loss calculation is confusing
- Currency revaluation at period-end is manual
- No visual summary of multi-currency exposure

## Proposed Solution
Auto-fetch live forex rates, one-click currency revaluation, and clear gain/loss reporting with visual exposure dashboards.

### Key Features
1. **Live Forex Rates**: Auto-fetch from RBI/open APIs, cache locally
2. **Rate History**: Track historical rates for any currency pair
3. **Auto-Calculate Gain/Loss**: Realized on payment, unrealized on balance sheet date
4. **Revaluation Wizard**: One-click period-end revaluation with journal entries
5. **Exposure Dashboard**: Visual breakdown of foreign currency balances

## UI Mockup (Easy Mode)
```
┌──────────────────────────────────────────┐
│ Currency Dashboard                        │
├──────────────────────────────────────────┤
│ Live Rates (as of 15-Apr-2026 12:00 PM)  │
│ USD/INR: 83.45 ↑0.12  EUR/INR: 91.20 ↓  │
│ GBP/INR: 105.80 ↑     JPY/INR: 0.56 →   │
│                                           │
│ Foreign Currency Exposure:                │
│ ┌─────────┬──────────┬──────────────┐    │
│ │ Currency│ Balance  │ INR Value    │    │
│ │ USD     │ 25,000   │ 20,86,250   │    │
│ │ EUR     │ 10,000   │ 9,12,000    │    │
│ │ GBP     │ 5,000    │ 5,29,000    │    │
│ └─────────┴──────────┴──────────────┘    │
│                                           │
│ Unrealized Gain/Loss: ₹45,230 (Gain)    │
│ [Run Revaluation]  [View History]        │
└──────────────────────────────────────────┘
```

## Data Requirements
- Currency master from Tally
- Forex rate API (exchangerate-api.com or RBI data)
- Transaction-level currency and rate storage
- Revaluation journal entry templates

## Tally XML APIs Needed
```xml
<!-- Fetch currency masters -->
<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
<BODY><EXPORTDATA><REQUESTDESC>
<REPORTNAME>List of Currencies</REPORTNAME>
</REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>

<!-- Create revaluation journal -->
<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
<REQUESTDATA><TALLYMESSAGE>
<VOUCHER VCHTYPE="Journal" ACTION="Create">
<NARRATION>Forex Revaluation - Apr 2026</NARRATION>
</VOUCHER>
</TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>
```

## Implementation Steps
1. Create currency master sync from Tally
2. Integrate forex rate API with caching (refresh every 4 hours)
3. Build exposure dashboard with charts
4. Implement gain/loss calculation engine
5. Create revaluation wizard with preview of journal entries
6. Add rate history viewer with charts

## Priority Level
🟡 **Medium** — Important for import/export businesses

## Estimated Effort
- Forex API integration: 1 day
- Exposure dashboard: 2 days
- Gain/loss engine: 2 days
- Revaluation wizard: 2 days
- Total: ~7 days
