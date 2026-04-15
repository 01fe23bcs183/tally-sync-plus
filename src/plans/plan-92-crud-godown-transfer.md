# Plan 92: CRUD — Multi-Godown & Stock Transfers

## Covers Plans
- Plan 20 (Multi-Godown Management)

## Database Schema

```sql
-- Godowns (Warehouses/Locations)
CREATE TABLE godowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES godowns(id) ON DELETE SET NULL,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Stock Transfers
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transfer_number TEXT NOT NULL,
  date DATE NOT NULL,
  from_godown_id UUID REFERENCES godowns(id) NOT NULL,
  to_godown_id UUID REFERENCES godowns(id) NOT NULL,
  status TEXT CHECK (status IN ('Draft', 'InTransit', 'Received', 'Cancelled')) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, transfer_number)
);

-- Transfer Line Items
CREATE TABLE stock_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES stock_transfers(id) ON DELETE CASCADE NOT NULL,
  stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
  batch_id UUID REFERENCES stock_batches(id),
  qty NUMERIC(15,3) NOT NULL,
  rate NUMERIC(15,2),
  received_qty NUMERIC(15,3) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Godown-wise Stock (materialized view or computed)
CREATE TABLE godown_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  godown_id UUID REFERENCES godowns(id) ON DELETE CASCADE NOT NULL,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES stock_batches(id),
  qty NUMERIC(15,3) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(godown_id, stock_item_id, batch_id)
);

-- RLS
ALTER TABLE godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE godown_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own godowns" ON godowns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transfers" ON stock_transfers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transfer_items" ON stock_transfer_items FOR ALL
  USING (EXISTS (SELECT 1 FROM stock_transfers WHERE stock_transfers.id = stock_transfer_items.transfer_id AND stock_transfers.user_id = auth.uid()));
CREATE POLICY "Users manage own godown_stock" ON godown_stock FOR ALL
  USING (EXISTS (SELECT 1 FROM godowns WHERE godowns.id = godown_stock.godown_id AND godowns.user_id = auth.uid()));
```

## CRUD Operations

### Create
- **Add Godown**: name, parent godown, address, contact
- **Create Transfer**: from/to godown, select items + qty + batch, notes
- **Set Opening Stock by Godown**: distribute opening stock across godowns
- Validation: from ≠ to godown, qty ≤ available in source godown

### Read
- **Godown List**: tree view with stock value per godown
- **Godown Stock View**: per-godown item list with qty and value
- **Transfer Register**: all transfers with status, route, total value
- **In-Transit Stock**: items currently being transferred
- **Godown Comparison**: side-by-side stock levels across godowns

### Update
- **Edit Godown**: rename, change address, re-parent
- **Dispatch Transfer**: Draft → InTransit
- **Receive Transfer**: InTransit → Received (enter received qty, handle shortages)
- **Cancel Transfer**: Draft/InTransit → Cancelled
- **Adjust Stock**: manual godown stock corrections with reason

### Delete
- **Delete Godown**: only if no stock and no transfers reference it
- **Delete Transfer**: only Draft status

## UI Components
- `GodownTree` — hierarchical godown view with inline CRUD
- `GodownStockGrid` — item-wise stock per godown with totals
- `TransferForm` — from/to godown selector + item picker + qty entry
- `TransferRegister` — table with status workflow buttons
- `GodownComparisonTable` — multi-column stock comparison
- `StockAdjustmentDialog` — manual qty correction with reason field
