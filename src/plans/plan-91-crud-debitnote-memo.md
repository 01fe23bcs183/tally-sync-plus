# Plan 91: CRUD — Debit/Credit Notes & Memo Vouchers

## Covers Plans
- Plan 09 (Debit/Credit Note Workflow)
- Plan 10 (Memorandum Vouchers)

## Database Schema

Uses the `vouchers` table from Plan 82 with voucher_type = 'DebitNote' | 'CreditNote' | 'Memo'.

```sql
-- Debit/Credit Note Reasons
CREATE TABLE note_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  type TEXT CHECK (type IN ('Debit', 'Credit', 'Both')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reason)
);

-- Note Details (extends vouchers for DN/CN specific fields)
CREATE TABLE note_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE NOT NULL,
  reason_id UUID REFERENCES note_reasons(id),
  original_voucher_id UUID REFERENCES vouchers(id),
  original_invoice_number TEXT,
  original_invoice_date DATE,
  is_gst_applicable BOOLEAN DEFAULT true,
  note_type TEXT CHECK (note_type IN ('FinancialNote', 'QuantityReturn', 'RateCorrection', 'Other')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memo Conversion Log
CREATE TABLE memo_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_voucher_id UUID REFERENCES vouchers(id) NOT NULL,
  converted_voucher_id UUID REFERENCES vouchers(id) NOT NULL,
  converted_at TIMESTAMPTZ DEFAULT now(),
  converted_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE note_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reasons" ON note_reasons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own note_details" ON note_details FOR ALL
  USING (EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = note_details.voucher_id AND vouchers.user_id = auth.uid()));
CREATE POLICY "Users manage own conversions" ON memo_conversions FOR ALL
  USING (EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = memo_conversions.memo_voucher_id AND vouchers.user_id = auth.uid()));
```

## CRUD Operations

### Create
- **Add Reason**: reason text, type (Debit/Credit/Both)
- **Create Debit Note**: party, original invoice ref, reason, amount, GST adjustment
- **Create Credit Note**: party, original invoice ref, reason, amount, GST adjustment
- **Create Memo Voucher**: same as regular voucher but marked as memo
- **Convert Memo**: convert memo to active voucher (creates new voucher, logs conversion)
- Validation: original invoice must exist for linked DN/CN, GST amounts must match

### Read
- **DN Register**: list of debit notes with original invoice ref, reason, status
- **CN Register**: list of credit notes with same details
- **Memo Register**: list of memo vouchers with conversion status
- **Reason Master**: list of all configured reasons
- **Conversion Log**: history of memo → regular conversions

### Update
- **Edit DN/CN**: modify before filing GST return, update amounts, reason
- **Edit Memo**: modify like any voucher
- **Edit Reason**: rename, change type, deactivate

### Delete
- **Delete DN/CN**: only if not yet filed in GST return
- **Delete Memo**: delete or convert
- **Delete Reason**: only if no notes use it

## UI Components
- `NoteReasonManager` — CRUD table for reasons
- `DebitNoteForm` — form with original invoice lookup, reason selector, amount with GST
- `CreditNoteForm` — same structure as debit note
- `MemoVoucherForm` — standard voucher form with "Memo" badge
- `MemoConvertDialog` — preview + confirm conversion to regular voucher
- `NoteRegisterTable` — combined DN/CN register with filters
