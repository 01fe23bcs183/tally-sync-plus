# Plan 93: CRUD — Manufacturing & Bill of Materials

## Covers Plans
- Plan 21 (Manufacturing/BOM)

## Database Schema

```sql
-- BOM (Bill of Materials) / Recipes
CREATE TABLE bom_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  finished_item_id UUID REFERENCES stock_items(id) NOT NULL,
  finished_qty NUMERIC(15,3) NOT NULL DEFAULT 1,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- BOM Components (raw materials)
CREATE TABLE bom_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID REFERENCES bom_masters(id) ON DELETE CASCADE NOT NULL,
  stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
  qty NUMERIC(15,3) NOT NULL,
  waste_percentage NUMERIC(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Production Orders
CREATE TABLE production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  bom_id UUID REFERENCES bom_masters(id) NOT NULL,
  planned_qty NUMERIC(15,3) NOT NULL,
  produced_qty NUMERIC(15,3) DEFAULT 0,
  date DATE NOT NULL,
  due_date DATE,
  godown_id UUID REFERENCES godowns(id),
  status TEXT CHECK (status IN ('Planned', 'InProgress', 'Completed', 'Cancelled')) DEFAULT 'Planned',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, order_number)
);

-- Material Consumption (actual usage per production)
CREATE TABLE material_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE NOT NULL,
  stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
  batch_id UUID REFERENCES stock_batches(id),
  planned_qty NUMERIC(15,3) NOT NULL,
  actual_qty NUMERIC(15,3) NOT NULL,
  variance NUMERIC(15,3) GENERATED ALWAYS AS (actual_qty - planned_qty) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE bom_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_consumption ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boms" ON bom_masters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bom_components" ON bom_components FOR ALL
  USING (EXISTS (SELECT 1 FROM bom_masters WHERE bom_masters.id = bom_components.bom_id AND bom_masters.user_id = auth.uid()));
CREATE POLICY "Users manage own production" ON production_orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own consumption" ON material_consumption FOR ALL
  USING (EXISTS (SELECT 1 FROM production_orders WHERE production_orders.id = material_consumption.production_order_id AND production_orders.user_id = auth.uid()));
```

## CRUD Operations

### Create
- **Add BOM**: finished item, qty, add component items with qty and waste %
- **Create Production Order**: select BOM, planned qty (auto-scale components), date, due date, godown
- **Record Consumption**: actual materials used vs planned (per production order)
- **Record Output**: finished goods produced, update stock
- Validation: BOM must have ≥1 component, planned qty > 0, sufficient raw material stock

### Read
- **BOM List**: all recipes with finished item, component count, cost estimate
- **BOM Detail**: component breakdown with qty, waste, total requirement
- **Production Register**: all orders with status, planned vs produced, dates
- **Consumption Report**: actual vs planned material usage with variance
- **Cost Analysis**: per-unit production cost from actual consumption

### Update
- **Edit BOM**: add/remove/modify components, update version
- **Start Production**: Planned → InProgress
- **Complete Production**: enter produced qty, auto-deduct raw materials, add finished goods
- **Cancel Production**: Planned/InProgress → Cancelled
- **Adjust Consumption**: correct actual qty entries

### Delete
- **Delete BOM**: only if no production orders reference it
- **Delete Production Order**: only Planned status
- **Delete Consumption Entry**: only for InProgress orders

## UI Components
- `BOMEditorForm` — finished item + component grid with qty, waste%, auto-cost
- `BOMListTable` — list with component preview and estimated cost
- `ProductionOrderForm` — BOM selector + qty + date + godown
- `ProductionTracker` — kanban or table view of order statuses
- `ConsumptionEntryForm` — planned vs actual grid per component
- `ProductionCostCard` — per-unit cost breakdown from actuals
