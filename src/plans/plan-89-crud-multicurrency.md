# Plan 89: CRUD — Multi-Currency & Forex

## Covers Plans
- Plan 03 (Multi-Currency Support)

## Database Schema

```sql
-- Currency Masters
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL, -- ISO 4217: USD, EUR, GBP
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_base BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Exchange Rates
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_currency_id UUID REFERENCES currencies(id) NOT NULL,
  to_currency_id UUID REFERENCES currencies(id) NOT NULL,
  rate NUMERIC(15,6) NOT NULL,
  effective_date DATE NOT NULL,
  source TEXT CHECK (source IN ('Manual', 'RBI', 'API')) DEFAULT 'Manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, from_currency_id, to_currency_id, effective_date)
);

-- Forex Gain/Loss Entries
CREATE TABLE forex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  currency_id UUID REFERENCES currencies(id) NOT NULL,
  original_amount NUMERIC(15,2) NOT NULL,
  original_rate NUMERIC(15,6) NOT NULL,
  settlement_rate NUMERIC(15,6) NOT NULL,
  gain_loss NUMERIC(15,2) NOT NULL,
  type TEXT CHECK (type IN ('Realized', 'Unrealized')) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE forex_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own currencies" ON currencies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own rates" ON exchange_rates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own forex" ON forex_entries FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add Currency**: code, name, symbol, decimal places, set as base
- **Add Exchange Rate**: from/to currency, rate, date, source
- **Record Forex Gain/Loss**: auto-calculate on payment at different rate, or revaluation
- **Bulk Rate Import**: paste/upload daily rates from RBI
- Validation: only one base currency, rate > 0, ISO 4217 code format

### Read
- **Currency List**: all currencies with latest rate to base
- **Rate History**: per currency pair rate chart over time
- **Forex Report**: realized + unrealized gains/losses by currency, period
- **Multi-Currency Trial Balance**: balances in original currency + base currency equivalent

### Update
- **Edit Currency**: name, symbol, activate/deactivate (not code)
- **Edit Rate**: correct a rate entry
- **Revalue**: recalculate unrealized forex entries at current rate
- **Change Base**: re-set base currency (warn: recomputes all base amounts)

### Delete
- **Delete Currency**: only if no vouchers, rates, or forex entries reference it
- **Delete Rate**: individual rate entry removal
- **Delete Forex Entry**: only unrealized entries (realized are permanent)

## UI Components
- `CurrencyMasterTable` — CRUD table with symbols and latest rates
- `ExchangeRateManager` — date picker + rate entry grid with rate history chart
- `ForexGainLossReport` — summary table with realized/unrealized split
- `CurrencySelector` — dropdown in voucher entry for foreign currency transactions
- `RateHistoryChart` — line chart of exchange rate over time
