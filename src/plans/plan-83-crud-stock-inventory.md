# Plan 83: CRUD — Stock Items, Groups & Units

## Covers Plans
- Plan 18 (Barcode/QR Scanning)
- Plan 19 (Batch & Expiry Tracking)
- Plan 24 (Stock Aging Analysis)
- Plan 25 (Reorder Alerts)

## Database Schema

```sql
-- Units of Measure
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Stock Groups
CREATE TABLE stock_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES stock_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Stock Items
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  group_id UUID REFERENCES stock_groups(id),
  unit_id UUID REFERENCES units(id),
  hsn_code TEXT,
  gst_rate NUMERIC(5,2),
  opening_qty NUMERIC(15,3) DEFAULT 0,
  opening_rate NUMERIC(15,2) DEFAULT 0,
  opening_value NUMERIC(15,2) DEFAULT 0,
  reorder_level NUMERIC(15,3) DEFAULT 0,
  min_order_qty NUMERIC(15,3) DEFAULT 0,
  preferred_supplier_id UUID REFERENCES ledgers(id),
  barcode TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Batches
CREATE TABLE stock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT NOT NULL,
  manufacturing_date DATE,
  expiry_date DATE,
  qty NUMERIC(15,3) DEFAULT 0,
  rate NUMERIC(15,2) DEFAULT 0,
  godown_id UUID,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own units" ON units FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own stock_groups" ON stock_groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own stock_items" ON stock_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own batches" ON stock_batches FOR ALL
  USING (EXISTS (SELECT 1 FROM stock_items WHERE stock_items.id = stock_batches.stock_item_id AND stock_items.user_id = auth.uid()));
```

## CRUD Operations

### Create
- **Add Unit**: name, symbol, decimal places (e.g., Nos, Kg, Ltr, Box)
- **Add Stock Group**: name, parent group
- **Add Stock Item**: name, group, unit, HSN, GST rate, opening stock (qty/rate/value), reorder level, barcode
- **Add Batch**: batch number, mfg date, expiry date, qty, rate, godown
- **Generate Barcode**: auto-generate EAN-13/Code-128 for items without barcode
- Validation: unique names, HSN format, GST rate 0/5/12/18/28

### Read
- **Stock Summary**: all items with current qty, value, reorder status
- **Stock Group Tree**: hierarchical group view
- **Item Detail**: full card with batches, movement history, aging
- **Batch List**: per-item batch view with expiry highlighting (red <30 days, yellow <90 days)
- **Expiring Soon**: filtered list of batches expiring within N days
- **Below Reorder**: items where current qty < reorder_level
- **Barcode Lookup**: scan/type barcode → show item details

### Update
- **Edit Item**: all fields, warn if changing unit after transactions exist
- **Edit Batch**: qty adjustments, rate updates
- **Update Reorder Level**: inline edit on stock summary
- **Deactivate Item**: soft delete, hide from selection lists

### Delete
- **Delete Unit**: only if no stock items use it
- **Delete Group**: only if empty (no items, no child groups)
- **Delete Item**: only if no voucher entries reference it, confirmation with stock value shown
- **Delete Batch**: only if qty is 0

## UI Components
- `StockItemListPage` — table with group filter, reorder alerts, search
- `StockItemFormDialog` — create/edit with batch sub-form
- `StockGroupTree` — expandable tree with CRUD inline
- `BatchManagerSheet` — manage batches per item
- `BarcodeScanner` — camera-based scan + manual entry
- `ExpiryAlertBanner` — shows count of items expiring soon
- `ReorderAlertList` — items below reorder level with supplier info
