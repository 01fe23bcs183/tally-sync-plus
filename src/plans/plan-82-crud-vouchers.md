# Plan 82: CRUD — Voucher Entry & Management

## Covers Plans
- Plan 01 (Smart Voucher Entry)
- Plan 02 (Bulk Voucher Import)
- Plan 09 (Debit/Credit Notes)
- Plan 10 (Memorandum Vouchers)
- Plan 39 (Undo/Redo — voucher-level)
- Plan 40 (Auto-Save & Draft)
- Plan 66 (AI Data Entry — voucher auto-fill)
- Plan 71 (Recurring Vouchers)

## Database Schema

```sql
-- Voucher Types Enum
CREATE TYPE voucher_type AS ENUM (
  'Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra',
  'DebitNote', 'CreditNote', 'Memo', 'SalesOrder', 'PurchaseOrder'
);

CREATE TYPE voucher_status AS ENUM ('Draft', 'Active', 'Cancelled', 'Converted');

-- Vouchers (Header)
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_number TEXT NOT NULL,
  voucher_type voucher_type NOT NULL,
  date DATE NOT NULL,
  reference_number TEXT,
  narration TEXT,
  status voucher_status DEFAULT 'Active',
  is_memo BOOLEAN DEFAULT false,
  converted_from UUID REFERENCES vouchers(id),
  recurring_id UUID,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, voucher_number, voucher_type)
);

-- Voucher Line Items (Dr/Cr entries)
CREATE TABLE voucher_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE NOT NULL,
  ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  entry_type TEXT CHECK (entry_type IN ('Dr', 'Cr')) NOT NULL,
  narration TEXT,
  cost_center_id UUID,
  bill_ref TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recurring Voucher Templates
CREATE TABLE recurring_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  voucher_type voucher_type NOT NULL,
  frequency TEXT CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  next_run DATE NOT NULL,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vouchers" ON vouchers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own entries" ON voucher_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = voucher_entries.voucher_id AND vouchers.user_id = auth.uid()));
CREATE POLICY "Users manage own templates" ON recurring_templates FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **New Voucher**: date, type, multiple Dr/Cr lines with ledger autocomplete, narration
- **Bulk Import**: CSV/Excel upload → validate → preview → insert batch
- **From Memo**: convert memo voucher to active (update status + converted_from)
- **From Recurring**: auto-generate voucher from template on schedule
- **Draft Save**: auto-save incomplete vouchers as Draft status
- Validation: Dr total must equal Cr total, at least 2 entries, date required, ledger required

### Read
- **Day Book**: all vouchers for a date range, grouped by type
- **Voucher Register**: filtered by type, date range, ledger, amount range
- **Single Voucher View**: header + all line items + audit info
- **Recurring List**: all templates with next run date, frequency, status
- **Draft List**: incomplete vouchers to resume editing

### Update
- **Edit Voucher**: modify any field, re-validate Dr=Cr balance
- **Cancel Voucher**: set status to Cancelled (soft delete, keeps audit trail)
- **Convert Memo**: change is_memo to false, status to Active
- **Edit Recurring**: modify template, frequency, dates
- **Reorder Entries**: drag-drop or sort_order update

### Delete
- **Delete Voucher**: hard delete only for Draft status, Cancelled vouchers kept for audit
- **Delete Recurring**: deactivate or hard delete template
- **Bulk Delete**: multi-select drafts for cleanup
- Confirmation with voucher number and amount shown

## React Query Hooks
```typescript
useQuery(['vouchers', filters], fetchVouchers)
useQuery(['voucher', id], fetchVoucherWithEntries)
useMutation(createVoucher) // inserts voucher + entries in transaction
useMutation(updateVoucher)
useMutation(cancelVoucher)
useMutation(convertMemo)
useMutation(bulkImportVouchers)
```

## UI Components
- `VoucherEntryForm` — multi-line Dr/Cr entry with running total, ledger autocomplete
- `VoucherListPage` — filterable table with type tabs
- `VoucherDetailSheet` — read-only view with print option
- `BulkImportDialog` — file upload, column mapping, preview, import
- `RecurringTemplateForm` — schedule builder with preview
- `DraftBanner` — shows unsaved draft count, click to resume
