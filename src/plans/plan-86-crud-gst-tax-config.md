# Plan 86: CRUD — GST Configuration & Tax Masters

## Covers Plans
- Plan 11 (GST Return Filing)
- Plan 12 (GST Reconciliation)
- Plan 89 config data for GST

## Database Schema

```sql
-- GST Configuration
CREATE TABLE gst_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gstin TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  state_code TEXT NOT NULL,
  registration_type TEXT CHECK (registration_type IN ('Regular', 'Composition', 'Unregistered', 'Consumer')) DEFAULT 'Regular',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gstin)
);

-- HSN/SAC Master
CREATE TABLE hsn_sac_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('HSN', 'SAC')) NOT NULL,
  gst_rate NUMERIC(5,2) NOT NULL,
  cgst_rate NUMERIC(5,2) GENERATED ALWAYS AS (gst_rate / 2) STORED,
  sgst_rate NUMERIC(5,2) GENERATED ALWAYS AS (gst_rate / 2) STORED,
  igst_rate NUMERIC(5,2) GENERATED ALWAYS AS (gst_rate) STORED,
  cess_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, code)
);

-- GST Return Periods
CREATE TABLE gst_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  return_type TEXT CHECK (return_type IN ('GSTR1', 'GSTR3B', 'GSTR9', 'GSTR2A', 'GSTR2B')) NOT NULL,
  period TEXT NOT NULL, -- e.g., '2024-01'
  status TEXT CHECK (status IN ('Draft', 'Filed', 'Revised')) DEFAULT 'Draft',
  filing_date DATE,
  arn TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, return_type, period)
);

-- GST Reconciliation
CREATE TABLE gst_recon_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  supplier_gstin TEXT NOT NULL,
  supplier_name TEXT,
  book_amount NUMERIC(15,2),
  portal_amount NUMERIC(15,2),
  difference NUMERIC(15,2) GENERATED ALWAYS AS (COALESCE(book_amount, 0) - COALESCE(portal_amount, 0)) STORED,
  status TEXT CHECK (status IN ('Matched', 'Mismatch', 'Missing_in_Books', 'Missing_in_Portal')) DEFAULT 'Mismatch',
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE gst_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_sac_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_recon_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own gst_config" ON gst_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own hsn" ON hsn_sac_codes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own returns" ON gst_returns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recon" ON gst_recon_entries FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add GSTIN**: GSTIN, legal name, trade name, state code, registration type
- **Add HSN/SAC**: code, description, type, GST rate, cess rate
- **Create Return Period**: return type, period, auto-compute from vouchers
- **Import GSTR-2A/2B**: upload JSON from GST portal for reconciliation
- Validation: GSTIN format (15-char alphanumeric), HSN 4-8 digits, SAC 6 digits

### Read
- **GST Dashboard**: filing status by period, pending returns, tax liability summary
- **HSN Summary**: all codes with usage count (how many items use each)
- **GSTR-1 Preview**: auto-generated from sales vouchers, B2B/B2C/HSN summary
- **GSTR-3B Preview**: auto-computed tax liability from vouchers
- **Recon Report**: matched vs mismatched vs missing entries with amounts

### Update
- **Edit GSTIN**: update trade name, registration type
- **Edit HSN/SAC**: change rate (warn about existing items), update description
- **Mark Return Filed**: update status, add ARN and filing date
- **Resolve Recon**: mark entries as resolved, add action notes
- **Revise Return**: create revised entry, keep original

### Delete
- **Delete GSTIN**: only if no vouchers reference it
- **Delete HSN/SAC**: only if no stock items use it
- **Delete Return Draft**: only Draft status deletable
- **Delete Recon Entry**: cleanup resolved entries

## UI Components
- `GSTConfigForm` — GSTIN entry with validation and state auto-detect
- `HSNSACManager` — searchable table with inline add/edit
- `GSTReturnViewer` — tabbed view (GSTR-1, GSTR-3B) with auto-computed data
- `GSTReconWorkspace` — comparison table with match/mismatch highlighting
- `ReturnFilingStatus` — timeline/calendar view of filing status by period
