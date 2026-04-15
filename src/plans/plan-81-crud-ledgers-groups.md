# Plan 81: CRUD — Ledger Masters & Account Groups

## Covers Plans
- Plan 01 (Smart Voucher Entry — ledger selection)
- Plan 04 (Cost Centers — ledger-cost center linking)
- Plan 08 (Bill-wise — party ledger references)
- Plan 30 (Outstanding Management — party ledgers)
- Plan 68 (Balance Confirmation — party ledger data)

## Database Schema

```sql
-- Account Groups
CREATE TABLE account_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES account_groups(id) ON DELETE SET NULL,
  nature TEXT CHECK (nature IN ('Assets', 'Liabilities', 'Income', 'Expenses')) NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Ledger Masters
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  group_id UUID REFERENCES account_groups(id) NOT NULL,
  opening_balance NUMERIC(15,2) DEFAULT 0,
  opening_balance_type TEXT CHECK (opening_balance_type IN ('Dr', 'Cr')) DEFAULT 'Dr',
  gstin TEXT,
  pan TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  credit_period_days INTEGER DEFAULT 0,
  credit_limit NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- RLS
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own groups" ON account_groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own ledgers" ON ledgers FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add Group**: name, parent group (dropdown of existing), nature
- **Add Ledger**: name, group (dropdown), opening balance, Dr/Cr, GSTIN, PAN, address, phone, email, credit period, credit limit
- Validation: unique name per user, group required, opening balance numeric

### Read
- **List Groups**: tree view with parent-child hierarchy, expand/collapse
- **List Ledgers**: searchable table with group filter, balance column, active/inactive filter
- **View Ledger Detail**: full info card + recent transactions + closing balance
- **Ledger Statement**: date-range filtered transaction list with running balance

### Update
- **Edit Group**: rename, change parent (prevent circular), change nature (warn if ledgers exist)
- **Edit Ledger**: all fields editable, warn if opening balance changed after vouchers exist
- Inline edit for quick changes (name, phone, email)

### Delete
- **Delete Group**: only if no child groups and no ledgers under it, confirmation dialog
- **Delete Ledger**: only if no voucher entries reference it, soft delete (is_active = false) or hard delete with confirmation
- Bulk delete with multi-select checkbox

## React Query Hooks
```typescript
// hooks/useLedgers.ts
useQuery(['ledgers'], () => supabase.from('ledgers').select('*, account_groups(name, nature)'))
useMutation(createLedger, { onSuccess: () => queryClient.invalidateQueries(['ledgers']) })
useMutation(updateLedger, { onSuccess: () => queryClient.invalidateQueries(['ledgers']) })
useMutation(deleteLedger, { onSuccess: () => queryClient.invalidateQueries(['ledgers']) })
```

## UI Components
- `LedgerListPage` — table with search, filter by group, sort by name/balance
- `LedgerFormDialog` — create/edit form with validation
- `GroupTreeView` — hierarchical group management
- `LedgerDetailSheet` — slide-out with full details + recent txns
- `DeleteConfirmDialog` — warns about dependencies before delete

## Seed Data
Default groups: Cash-in-Hand, Bank Accounts, Sundry Debtors, Sundry Creditors, Purchase Accounts, Sales Accounts, Direct Expenses, Indirect Expenses, Fixed Assets, Current Assets, Current Liabilities, Capital Account, Loans (Liability), Duties & Taxes
