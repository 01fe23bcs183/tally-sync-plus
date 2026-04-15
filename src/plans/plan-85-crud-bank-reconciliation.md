# Plan 85: CRUD — Bank Reconciliation & Cash/Bank Book

## Covers Plans
- Plan 06 (Bank Reconciliation)
- Plan 72 (Cash & Bank Book)
- Plan 69 (Cheque Management & PDC)

## Database Schema

```sql
-- Bank Reconciliation Sessions
CREATE TABLE recon_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank_ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  statement_date DATE NOT NULL,
  statement_balance NUMERIC(15,2) NOT NULL,
  book_balance NUMERIC(15,2),
  status TEXT CHECK (status IN ('InProgress', 'Completed')) DEFAULT 'InProgress',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reconciliation Matches
CREATE TABLE recon_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES recon_sessions(id) ON DELETE CASCADE NOT NULL,
  voucher_entry_id UUID REFERENCES voucher_entries(id),
  statement_line_ref TEXT,
  statement_amount NUMERIC(15,2),
  statement_date DATE,
  is_matched BOOLEAN DEFAULT false,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cheque Register
CREATE TABLE cheques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cheque_number TEXT NOT NULL,
  bank_ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id),
  voucher_id UUID REFERENCES vouchers(id),
  amount NUMERIC(15,2) NOT NULL,
  cheque_date DATE NOT NULL,
  is_post_dated BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('Issued', 'Received', 'Cleared', 'Bounced', 'Cancelled')) DEFAULT 'Issued',
  clearing_date DATE,
  bounce_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE recon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recon_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recon" ON recon_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own matches" ON recon_matches FOR ALL
  USING (EXISTS (SELECT 1 FROM recon_sessions WHERE recon_sessions.id = recon_matches.session_id AND recon_sessions.user_id = auth.uid()));
CREATE POLICY "Users manage own cheques" ON cheques FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **New Recon Session**: select bank ledger, enter statement date & balance, upload bank statement (CSV/Excel)
- **Match Entries**: auto-match by amount+date, manual drag-drop matching
- **Add Cheque**: cheque number, bank, party, amount, date, post-dated flag
- Validation: statement balance numeric, cheque number unique per bank

### Read
- **Cash Book**: running cash balance with all cash transactions, date filtered
- **Bank Book**: per-bank running balance, cleared/uncleared split
- **Recon Summary**: matched vs unmatched count, reconciled balance
- **Cheque Register**: filterable by bank, status, date range
- **PDC Maturity Calendar**: calendar view of post-dated cheques coming due

### Update
- **Match/Unmatch**: toggle match status on individual entries
- **Complete Recon**: mark session as completed, lock matches
- **Update Cheque Status**: Issued → Cleared, Issued → Bounced (with reason), etc.
- **Edit Cheque**: modify details before clearing

### Delete
- **Delete Recon Session**: only if InProgress, cascade deletes matches
- **Delete Cheque**: only if status is Issued (not yet cleared)

## UI Components
- `ReconWorkspace` — split view: book entries left, statement entries right, drag to match
- `CashBookView` — date-filtered cash ledger with running balance
- `BankBookView` — bank-wise ledger with cleared/uncleared columns
- `ChequeRegisterTable` — filterable cheque list with status badges
- `PDCCalendar` — month view showing upcoming cheque maturities
- `StatementUploadDialog` — CSV/Excel upload with column mapping
