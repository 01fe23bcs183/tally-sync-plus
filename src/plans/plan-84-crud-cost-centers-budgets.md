# Plan 84: CRUD — Cost Centers & Budgets

## Covers Plans
- Plan 04 (Cost Center Management)
- Plan 05 (Budget Management)
- Plan 28 (Ratio Analysis — budget vs actual ratios)

## Database Schema

```sql
-- Cost Center Categories
CREATE TABLE cost_center_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Cost Centers
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES cost_center_categories(id),
  parent_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Budget Periods
CREATE TABLE budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Budget Lines (per ledger/group per period)
CREATE TABLE budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period_id UUID REFERENCES budget_periods(id) ON DELETE CASCADE NOT NULL,
  ledger_id UUID REFERENCES ledgers(id),
  group_id UUID REFERENCES account_groups(id),
  cost_center_id UUID REFERENCES cost_centers(id),
  month DATE NOT NULL,
  budgeted_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  revised_amount NUMERIC(15,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE cost_center_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cc_categories" ON cost_center_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cost_centers" ON cost_centers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budget_periods" ON budget_periods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budget_lines" ON budget_lines FOR ALL
  USING (EXISTS (SELECT 1 FROM budget_periods WHERE budget_periods.id = budget_lines.budget_period_id AND budget_periods.user_id = auth.uid()));
```

## CRUD Operations

### Create
- **Add Category**: name
- **Add Cost Center**: name, category, parent cost center
- **Add Budget Period**: name (e.g. "FY 2024-25"), start/end dates
- **Add Budget Lines**: select period → ledger/group → enter monthly amounts (spreadsheet-style grid)
- **Copy Budget**: duplicate previous period's budget as starting point for new period
- Validation: date ranges, no overlapping periods, amounts >= 0

### Read
- **Cost Center List**: tree view with category grouping
- **Cost Center Report**: transactions allocated to each cost center with totals
- **Budget Overview**: period selector → ledger-wise budget vs actual table
- **Variance Report**: budget vs actual with % variance, color-coded (green under, red over)
- **Monthly Breakdown**: 12-column grid showing budget per month per ledger

### Update
- **Edit Cost Center**: rename, re-categorize, re-parent
- **Edit Budget Line**: inline edit amounts in the grid
- **Revise Budget**: update revised_amount without losing original budgeted_amount
- **Deactivate**: soft delete cost centers or close budget periods

### Delete
- **Delete Category**: only if no cost centers under it
- **Delete Cost Center**: only if no voucher entries allocated to it
- **Delete Budget Period**: cascade deletes all budget lines, confirmation required
- **Delete Budget Line**: individual line removal

## UI Components
- `CostCenterTree` — hierarchical view with inline add/edit/delete
- `CostCenterAllocator` — dropdown in voucher entry to allocate entries to cost centers
- `BudgetGridEditor` — spreadsheet-like 12-month grid for budget entry
- `BudgetVsActualChart` — bar chart comparing budget vs actual per ledger
- `VarianceTable` — color-coded table with drill-down to transactions
