# Plan 87: CRUD — E-Invoice & E-Way Bill

## Covers Plans
- Plan 13 (E-Invoice Generation)
- Plan 14 (E-Way Bill)

## Database Schema

```sql
-- E-Invoices
CREATE TABLE e_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id) NOT NULL,
  irn TEXT,
  ack_number TEXT,
  ack_date TIMESTAMPTZ,
  signed_qr TEXT,
  signed_invoice TEXT,
  status TEXT CHECK (status IN ('Pending', 'Generated', 'Cancelled', 'Failed')) DEFAULT 'Pending',
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  error_message TEXT,
  api_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- E-Way Bills
CREATE TABLE e_way_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  e_invoice_id UUID REFERENCES e_invoices(id),
  ewb_number TEXT,
  ewb_date TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  from_place TEXT NOT NULL,
  from_state TEXT NOT NULL,
  from_pincode TEXT NOT NULL,
  to_place TEXT NOT NULL,
  to_state TEXT NOT NULL,
  to_pincode TEXT NOT NULL,
  transport_mode TEXT CHECK (transport_mode IN ('Road', 'Rail', 'Air', 'Ship')) DEFAULT 'Road',
  vehicle_number TEXT,
  transporter_id TEXT,
  distance_km INTEGER,
  status TEXT CHECK (status IN ('Pending', 'Active', 'Expired', 'Cancelled', 'Extended')) DEFAULT 'Pending',
  cancel_reason TEXT,
  part_b_updated BOOLEAN DEFAULT false,
  api_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE e_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_way_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own e_invoices" ON e_invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own ewb" ON e_way_bills FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Generate E-Invoice**: select voucher → auto-fill from voucher data → call IRN API → store response
- **Generate E-Way Bill**: from voucher or e-invoice → fill transport details → call EWB API
- **Bulk Generate**: select multiple pending vouchers → batch generate
- Validation: voucher must have GSTIN, amount > ₹50K for e-invoice, transport details for EWB

### Read
- **E-Invoice Register**: list with IRN, status, date, amount, voucher ref
- **E-Way Bill Register**: list with EWB number, validity, route, vehicle, status
- **Pending Queue**: vouchers eligible but not yet generated
- **Expiring EWB**: e-way bills expiring within 24/48 hours
- **Failed/Error List**: generation failures with error messages

### Update
- **Cancel E-Invoice**: within 24 hours, provide reason, call cancel API
- **Cancel E-Way Bill**: provide reason, call cancel API
- **Extend E-Way Bill**: extend validity with reason
- **Update Part-B**: add/change vehicle number and transport details
- **Retry Failed**: re-attempt generation for failed items

### Delete
- **Delete Pending**: remove pending records that were never generated
- No hard delete for generated IRN/EWB (compliance requirement)

## UI Components
- `EInvoiceGenerator` — voucher selector + preview + generate button
- `EInvoiceRegister` — filterable table with status badges and QR viewer
- `EWayBillForm` — transport details form with distance calculator
- `EWayBillRegister` — list with validity countdown timer
- `BulkGenerateDialog` — multi-select vouchers with progress bar
- `FailedItemsList` — error details with retry option
