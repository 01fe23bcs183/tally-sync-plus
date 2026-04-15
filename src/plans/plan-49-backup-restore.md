# Plan 49: Data Backup & Restore

## Problem Statement
Tally data corruption or accidental deletion can be catastrophic. Backup is manual and restore is complex.

## Current Pain Points
- Tally backup must be triggered manually
- No scheduled automatic backups
- Backup files are large and uncompressed
- Restore process is complex for non-technical users
- No cloud backup option
- No incremental backup — always full backup

## Proposed Solution
Automated backup scheduling with cloud storage, incremental backups, and one-click restore.

### Key Features
1. **Scheduled Backups**: Daily/weekly auto-backup of synced data
2. **Cloud Storage**: Store backups in cloud (optional, user's storage)
3. **Incremental Backup**: Only backup changes since last backup
4. **One-Click Restore**: Select backup point and restore
5. **Backup Verification**: Auto-verify backup integrity
6. **Retention Policy**: Keep last 7 daily, 4 weekly, 12 monthly


## UI — Easy Mode
Backup schedule cards, one-click backup button, restore wizard with calendar picker, backup history list


## UI — Tally Mode
Alt+B for backup menu, F5 to create backup now, restore list with dates, F7 to restore selected, backup log in Tally format


## Implementation Steps
1. Build data export engine (serialize all cached data)
2. Create backup scheduling system
3. Implement incremental backup (change tracking)
4. Build backup storage (IndexedDB + optional cloud)
5. Create restore workflow with verification
6. Add retention policy management

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
