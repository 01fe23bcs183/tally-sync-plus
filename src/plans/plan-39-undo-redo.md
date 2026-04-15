# Plan 39: Undo/Redo System

## Problem Statement
Tally has no undo functionality. A wrong entry means manually creating a reversal or deleting and re-entering.

## Current Pain Points
- No Ctrl+Z for voucher edits
- Accidental changes require manual correction
- Deleted vouchers cannot be recovered
- No version history for modified vouchers
- Batch changes cannot be rolled back

## Proposed Solution
Multi-level undo/redo for all data entry operations within the app, with version history for vouchers.

### Key Features
1. **In-App Undo**: Ctrl+Z/Ctrl+Y for form-level changes before save
2. **Version History**: Track all versions of a saved voucher
3. **Restore Previous**: One-click restore to any previous version
4. **Batch Rollback**: Undo all changes from a bulk operation
5. **Trash/Recycle Bin**: Deleted items recoverable for 30 days


## UI — Easy Mode
Undo/redo buttons in toolbar, action history panel with timestamps, click-to-restore any state


## UI — Tally Mode
Ctrl+Z undo, Ctrl+Y redo, Alt+H for action history list, F5 to restore specific state, confirmation prompt before undo


## Implementation Steps
1. Implement command pattern for all data mutations
2. Build undo/redo stack manager
3. Create version history storage
4. Build version comparison UI (diff view)
5. Implement trash/recycle bin
6. Add batch rollback capability

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
