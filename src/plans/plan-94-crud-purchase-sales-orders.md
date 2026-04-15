# Plan 94: CRUD — Purchase & Sales Orders

## Covers Plans
- Plan 22 (Purchase Order Management)
- Plan 23 (Sales Order Pipeline)

## Database Schema

```sql
-- Orders (unified for PO and SO)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  order_type TEXT CHECK (order_type IN ('Purchase', 'Sales')) NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  reference TEXT,
  status TEXT CHECK (status IN ('Draft', 'Open', 'PartiallyFulfilled', 'Fulfilled', 'Cancelled', 'Closed')) DEFAULT 'Draft',
  total_amount NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, order_number, order_type)
);

-- Order Line Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
  qty NUMERIC(15,3) NOT NULL,
  rate NUMERIC(15,2) NOT NULL,
  amount NUMERIC(15,2) GENERATED ALWAYS AS (qty * rate) STORED,
  fulfilled_qty NUMERIC(15,3) DEFAULT 0,
  pending_qty NUMERIC(15,3) GENERATED ALWAYS AS (qty - fulfilled_qty) STORED,
  gst_rate NUMERIC(5,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Fulfillment Links (which voucher fulfilled which order line)
CREATE TABLE order_fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id) NOT NULL,
  qty_fulfilled NUMERIC(15,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own orders" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own order_items" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users manage own fulfillments" ON order_fulfillments FOR ALL
  USING (EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.id = order_fulfillments.order_item_id AND o.user_id = auth.uid()));
```

## CRUD Operations

### Create
- **Create PO**: select supplier, add items with qty/rate/discount/GST, terms, due date
- **Create SO**: select customer, same item entry, terms
- **Convert SO to PO**: auto-generate PO from SO items (for dropship/made-to-order)
- **Create Voucher from Order**: auto-fill purchase/sales voucher from pending order items
- Validation: qty > 0, rate > 0, party required, at least 1 item

### Read
- **PO Register**: all purchase orders with status, supplier, total, pending items
- **SO Register**: all sales orders with status, customer, total, pending items
- **Order Detail**: header + line items with fulfillment progress bars
- **Pending Orders**: items not yet fully received/delivered
- **Order Pipeline**: visual pipeline (Draft → Open → Partial → Fulfilled)
- **Overdue Orders**: orders past due date with unfulfilled items

### Update
- **Edit Order**: modify items, qty, rate, dates (only Draft/Open status)
- **Fulfill Order**: link voucher to order, update fulfilled_qty
- **Partial Fulfill**: record partial receipt/delivery
- **Close Order**: manually close partially fulfilled orders (accept short delivery)
- **Cancel Order**: Draft/Open → Cancelled

### Delete
- **Delete Order**: only Draft status, cascade deletes items
- **Delete Fulfillment Link**: un-link a voucher from an order (recalculates pending)

## UI Components
- `OrderForm` — party selector + item grid with qty/rate/discount/GST/amount
- `PORegisterTable` — filterable PO list with status badges
- `SORegisterTable` — filterable SO list with status badges
- `OrderDetailSheet` — full order view with item progress bars
- `FulfillmentDialog` — select pending items + qty to fulfill against a voucher
- `OrderPipelineView` — kanban board showing orders by status
- `ConvertOrderDialog` — convert SO→PO or Order→Voucher
