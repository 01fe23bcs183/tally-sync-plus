# Plan 96: CRUD — Audit Trail & Activity Log

## Covers Plans
- Plan 17 (Audit Trail & Compliance)
- Plan 50 (Activity Log)
- Plan 59 (Data Access Audit Trail)

## Database Schema

```sql
-- Audit Log (immutable — insert only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT CHECK (action IN ('Create', 'Update', 'Delete', 'View', 'Export', 'Login', 'Logout')) NOT NULL,
  entity_type TEXT NOT NULL, -- 'voucher', 'ledger', 'stock_item', etc.
  entity_id UUID,
  entity_name TEXT,
  old_data JSONB,
  new_data JSONB,
  changes JSONB, -- diff of old vs new
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log is INSERT only — no update, no delete
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit log" ON audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own audit log" ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
-- No UPDATE or DELETE policies — immutable log
```

## CRUD Operations

### Create (Insert Only)
- **Auto-log on every CRUD action**: trigger-based or service-layer logging
- **Log data access**: when user views sensitive reports (P&L, Balance Sheet, etc.)
- **Log exports**: when user downloads PDF/Excel
- **Log auth events**: login, logout, password change
- Fields captured: who, what action, which entity, old data, new data, diff, timestamp, IP

### Read
- **Activity Timeline**: chronological log with user avatar, action, entity, time
- **Filter by User**: who did what
- **Filter by Entity**: all changes to a specific voucher/ledger
- **Filter by Action**: all deletes, all creates, etc.
- **Filter by Date Range**: audit for a specific period
- **Change Diff View**: side-by-side old vs new values for updates
- **Export Audit Log**: download as CSV/PDF for external auditors

### Update
- **No updates allowed** — audit log is immutable by design

### Delete
- **No deletes allowed** — audit log is immutable by design
- **Archival**: move old entries to cold storage after retention period (admin function)

## Implementation Notes
- Use a service-layer `logAudit()` function called in every mutation hook
- Compute `changes` as a JSON diff of old_data vs new_data
- For View/Export logging, call logAudit from report rendering components
- Consider using Supabase database triggers for server-side enforcement

```typescript
// services/auditService.ts
export const logAudit = async (params: {
  action: 'Create' | 'Update' | 'Delete' | 'View' | 'Export';
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldData?: any;
  newData?: any;
}) => {
  const changes = params.oldData && params.newData
    ? computeDiff(params.oldData, params.newData)
    : null;
  await supabase.from('audit_log').insert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    ...params,
    changes,
  });
};
```

## UI Components
- `AuditTimeline` — scrollable timeline with action icons and user info
- `AuditFilters` — user, entity type, action type, date range filters
- `ChangeDiffViewer` — side-by-side old/new comparison with highlighted changes
- `AuditExportButton` — download filtered log as CSV/PDF
- `EntityAuditTab` — embeddable tab for any entity detail view showing its change history
