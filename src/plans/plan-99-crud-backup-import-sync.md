# Plan 99: CRUD — Backup, Import, Sync & Offline

## Covers Plans
- Plan 44 (Excel/Google Sheets Sync)
- Plan 46 (Offline Mode)
- Plan 47 (Conflict Resolution)
- Plan 49 (Backup & Restore)
- Plan 64 (Backup Encryption & DR)
- Plan 78 (Data Import from Other Software)

## Database Schema

```sql
-- Backups
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key_hash TEXT,
  backup_type TEXT CHECK (backup_type IN ('Full', 'Incremental', 'Scheduled')) DEFAULT 'Full',
  status TEXT CHECK (status IN ('InProgress', 'Completed', 'Failed', 'Restoring')) DEFAULT 'InProgress',
  tables_included TEXT[],
  record_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Import Sessions
CREATE TABLE import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source TEXT CHECK (source IN ('TallyXML', 'Excel', 'CSV', 'Busy', 'Marg', 'QuickBooks', 'ZohoBooks', 'GoogleSheets')) NOT NULL,
  file_name TEXT,
  file_url TEXT,
  status TEXT CHECK (status IN ('Uploaded', 'Mapping', 'Validating', 'Previewing', 'Importing', 'Completed', 'Failed', 'RolledBack')) DEFAULT 'Uploaded',
  total_records INTEGER DEFAULT 0,
  imported_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  field_mapping JSONB DEFAULT '{}',
  validation_errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Sync Sessions (Excel/Sheets bi-directional)
CREATE TABLE sync_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sync_type TEXT CHECK (sync_type IN ('Excel', 'GoogleSheets', 'TallyAgent')) NOT NULL,
  direction TEXT CHECK (direction IN ('Import', 'Export', 'BiDirectional')) NOT NULL,
  status TEXT CHECK (status IN ('InProgress', 'Completed', 'Failed', 'ConflictsDetected')) DEFAULT 'InProgress',
  records_pushed INTEGER DEFAULT 0,
  records_pulled INTEGER DEFAULT 0,
  conflicts INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Sync Conflicts
CREATE TABLE sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_session_id UUID REFERENCES sync_sessions(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  local_data JSONB NOT NULL,
  remote_data JSONB NOT NULL,
  resolution TEXT CHECK (resolution IN ('KeepLocal', 'KeepRemote', 'Merge', 'Pending')) DEFAULT 'Pending',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Offline Queue (for offline mode pending actions)
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT CHECK (action IN ('Create', 'Update', 'Delete')) NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  payload JSONB NOT NULL,
  is_synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own backups" ON backups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own imports" ON import_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own syncs" ON sync_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conflicts" ON sync_conflicts FOR ALL
  USING (EXISTS (SELECT 1 FROM sync_sessions WHERE sync_sessions.id = sync_conflicts.sync_session_id AND sync_sessions.user_id = auth.uid()));
CREATE POLICY "Users manage own offline_queue" ON offline_queue FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Create Backup**: select company, tables to include, optional encryption password
- **Start Import**: upload file, select source format, auto-detect columns
- **Map Fields**: UI for mapping source columns to destination tables/columns
- **Start Sync**: select sync type and direction, authenticate if external (Google Sheets)
- **Queue Offline Action**: auto-queue mutations when offline
- Validation: file format matches source, required fields mapped, no duplicate keys

### Read
- **Backup List**: all backups with size, date, status, encryption status
- **Import History**: past imports with success/fail counts
- **Import Preview**: sample rows after validation before committing
- **Sync History**: past sync sessions with push/pull counts
- **Conflict List**: unresolved conflicts with side-by-side comparison
- **Offline Queue**: pending items waiting to sync

### Update
- **Restore Backup**: download → validate → restore to tables (heavy operation with confirmation)
- **Resolve Conflict**: choose KeepLocal, KeepRemote, or Merge
- **Retry Import**: re-run failed rows
- **Sync Offline Queue**: bulk push pending items when back online

### Delete
- **Delete Backup**: remove file from storage
- **Delete Import Session**: cleanup failed/old sessions
- **Clear Offline Queue**: after successful sync
- **Delete Conflict**: dismiss resolved conflicts

## UI Components
- `BackupManager` — create/list/restore/delete backups with encryption toggle
- `ImportWizard` — step wizard: Upload → Map → Validate → Preview → Import
- `FieldMappingGrid` — drag-drop source→destination column mapping
- `SyncDashboard` — sync status, history, start new sync
- `ConflictResolver` — side-by-side diff with resolution buttons
- `OfflineIndicator` — banner/badge showing offline status and pending queue count
