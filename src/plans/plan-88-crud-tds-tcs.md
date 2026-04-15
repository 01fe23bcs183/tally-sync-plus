# Plan 88: CRUD — TDS & TCS Management

## Covers Plans
- Plan 15 (TDS Management)
- Plan 16 (TCS Compliance)

## Database Schema

```sql
-- TDS/TCS Sections Master
CREATE TABLE tax_deduction_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_code TEXT NOT NULL, -- e.g., '194C', '206C(1H)'
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('TDS', 'TCS')) NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  threshold_amount NUMERIC(15,2) DEFAULT 0,
  surcharge_rate NUMERIC(5,2) DEFAULT 0,
  cess_rate NUMERIC(5,2) DEFAULT 4,
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_code, type)
);

-- Deductee/Collectee Masters (party-level config)
CREATE TABLE tax_party_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  pan TEXT NOT NULL,
  deductee_type TEXT CHECK (deductee_type IN ('Individual', 'Company', 'Firm', 'HUF', 'AOP', 'Other')) NOT NULL,
  section_id UUID REFERENCES tax_deduction_sections(id),
  lower_rate NUMERIC(5,2), -- for lower deduction certificate
  lower_cert_number TEXT,
  lower_cert_valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ledger_id)
);

-- TDS/TCS Transactions
CREATE TABLE tax_deduction_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  party_config_id UUID REFERENCES tax_party_config(id),
  section_id UUID REFERENCES tax_deduction_sections(id) NOT NULL,
  type TEXT CHECK (type IN ('TDS', 'TCS')) NOT NULL,
  base_amount NUMERIC(15,2) NOT NULL,
  tax_amount NUMERIC(15,2) NOT NULL,
  rate_applied NUMERIC(5,2) NOT NULL,
  surcharge NUMERIC(15,2) DEFAULT 0,
  cess NUMERIC(15,2) DEFAULT 0,
  total_tax NUMERIC(15,2) NOT NULL,
  date DATE NOT NULL,
  is_deposited BOOLEAN DEFAULT false,
  deposit_date DATE,
  challan_number TEXT,
  certificate_number TEXT,
  certificate_date DATE,
  quarter TEXT, -- Q1, Q2, Q3, Q4
  financial_year TEXT, -- 2024-25
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE tax_deduction_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_party_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deduction_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sections" ON tax_deduction_sections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own party_config" ON tax_party_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own entries" ON tax_deduction_entries FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add Section**: section code, description, TDS/TCS, rate, threshold, surcharge, cess, effective dates
- **Add Party Config**: select party ledger, PAN, deductee type, default section, lower deduction cert
- **Record Deduction**: auto-calculate from voucher amount × rate, link to voucher
- **Record Deposit**: challan number, date, amount deposited
- **Issue Certificate**: certificate number, date, for a party and quarter
- Validation: PAN format, section code format, rate within valid range

### Read
- **Section Master List**: all sections with rates, thresholds, active status
- **Party-wise TDS/TCS**: per-party deduction summary for a FY
- **Quarterly Summary**: Q1-Q4 deduction and deposit totals
- **Pending Deposits**: deductions not yet deposited (overdue highlighting)
- **Certificate Tracker**: issued vs pending certificates per quarter
- **26Q/27Q Preview**: return data preview grouped by section

### Update
- **Edit Section**: update rate (with effective date), threshold
- **Edit Party Config**: change section, update lower cert, PAN correction
- **Mark Deposited**: update deposit date, challan number
- **Mark Certificate Issued**: add cert number and date
- **Bulk Update**: mark multiple entries as deposited in one go

### Delete
- **Delete Section**: only if no entries reference it
- **Delete Party Config**: only if no entries exist for this party
- **Delete Entry**: only Draft/undeposited entries, confirmation required

## UI Components
- `TDSSectionMaster` — CRUD table for sections with rate history
- `TCSCollecteeMaster` — party config manager
- `DeductionRegister` — filterable list with deposit status
- `DepositChallanForm` — record tax deposit against entries
- `CertificateTracker` — quarterly certificate generation & tracking
- `ReturnPreview` — 26Q/27Q format preview from computed data
