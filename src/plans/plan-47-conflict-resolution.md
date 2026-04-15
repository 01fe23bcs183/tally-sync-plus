# Plan 47: Conflict Resolution UI

## Problem Statement
When data changes in both Tally and the app (especially in offline mode), conflicts arise. No clear resolution mechanism exists.

## Current Pain Points
- Sync overwrites local changes silently
- No way to compare local vs Tally versions
- Bulk sync failures have no recovery path
- No audit trail of conflict resolutions
- User doesn't know which version is authoritative

## Proposed Solution
Visual conflict resolution with side-by-side diff, merge tools, and resolution policies.

### Key Features
1. **Conflict Detection**: Identify conflicting records during sync
2. **Side-by-Side Diff**: Show local vs Tally version with highlighted differences
3. **Resolution Options**: Keep local, keep Tally, merge manually
4. **Auto-Resolution Policies**: Configure per data type (e.g., "always prefer Tally for ledgers")
5. **Resolution History**: Log all conflict resolutions for audit

## UI Mockup
```
┌─────────────────────────────────────────────┐
│ ⚠️ Sync Conflict — Raj Traders Ledger       │
├──────────────────┬──────────────────────────┤
│ Local Version    │ Tally Version            │
│ Name: Raj Trader │ Name: Raj Traders & Co   │
│ Group: Debtors   │ Group: Debtors           │
│ GST: 27AABCR1234 │ GST: 27AABCR5678       │
│ Bal: ₹50,000     │ Bal: ₹48,500            │
├──────────────────┴──────────────────────────┤
│ [Keep Local] [Keep Tally] [Merge Manually]  │
└─────────────────────────────────────────────┘
```

## Implementation Steps
1. Implement change tracking with timestamps/hashes
2. Build conflict detection algorithm
3. Create diff computation engine
4. Build side-by-side comparison UI
5. Implement resolution options and merge tool
6. Create auto-resolution policy system
7. Log resolution history

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
