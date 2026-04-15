# Plan 90: CRUD — Bill-Wise Details & Interest Calculation

## Covers Plans
- Plan 07 (Interest Calculation)
- Plan 08 (Bill-wise Details)
- Plan 30 (Outstanding Management)

## Database Schema

```sql
-- Bill References
CREATE TABLE bill_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id) NOT NULL,
  bill_number TEXT NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE,
  original_amount NUMERIC(15,2) NOT NULL,
  pending_amount NUMERIC(15,2) NOT NULL,
  type TEXT CHECK (type IN ('New', 'Against', 'Advance', 'OnAccount')) NOT NULL,
  against_bill_id UUID REFERENCES bill_references(id),
  party_ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  status TEXT CHECK (status IN ('Open', 'Partial', 'Closed')) DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interest Configuration
CREATE TABLE interest_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  calc_method TEXT CHECK (calc_method IN ('Simple', 'Compound', 'MonthlyCompound')) DEFAULT 'Simple',
  calc_on TEXT CHECK (calc_on IN ('Outstanding', 'Overdue', 'BillWise')) DEFAULT 'Outstanding',
  grace_period_days INTEGER DEFAULT 0,
  min_amount NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ledger_id)
);

-- Interest Entries (computed interest)
CREATE TABLE interest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  config_id UUID REFERENCES interest_configs(id),
  ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  bill_ref_id UUID REFERENCES bill_references(id),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  principal NUMERIC(15,2) NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  days INTEGER NOT NULL,
  interest_amount NUMERIC(15,2) NOT NULL,
  is_posted BOOLEAN DEFAULT false,
  voucher_id UUID REFERENCES vouchers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE bill_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bills" ON bill_references FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own interest_configs" ON interest_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own interest_entries" ON interest_entries FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add Bill Reference**: on voucher entry, specify bill number, date, due date, amount, type (New/Against/Advance)
- **Match Against Bill**: select existing open bill to settle against
- **Add Interest Config**: per-party rate, method (simple/compound), grace period, min amount
- **Compute Interest**: calculate interest for a date range → preview → post as journal voucher
- Validation: against amount ≤ pending amount, bill number required for sales/purchase

### Read
- **Bills Receivable**: all open bills from debtors with aging columns (0-30, 31-60, 61-90, 90+)
- **Bills Payable**: all open bills to creditors with aging
- **Party Outstanding**: per-party summary with total open bills, overdue amount
- **Interest Statement**: per-party interest computed for a period with breakdown
- **Aging Analysis**: graphical aging of receivables and payables

### Update
- **Adjust Bill**: modify pending amount (partial receipt/payment)
- **Close Bill**: mark as fully settled
- **Edit Interest Config**: change rate, method, grace period
- **Post Interest**: create journal voucher from computed interest, mark entries as posted
- **Recompute Interest**: recalculate after payment adjustments

### Delete
- **Delete Bill Reference**: only if no settlements against it
- **Delete Interest Config**: doesn't affect already posted entries
- **Delete Interest Entry**: only unposted entries

## UI Components
- `BillReferenceForm` — bill details sub-form within voucher entry
- `OutstandingDashboard` — receivable/payable summary with aging chart
- `BillMatchingDialog` — select open bills to settle against
- `InterestConfigForm` — per-party interest rate setup
- `InterestComputeSheet` — compute, preview, and post interest entries
- `AgingChart` — stacked bar chart of aging buckets
