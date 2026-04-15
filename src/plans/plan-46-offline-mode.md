# Plan 46: Offline Mode

## Problem Statement
When Tally is not running (server restart, different computer, travel), the app becomes useless. Need to work with cached data.

## Current Pain Points
- App requires active Tally connection to show any data
- Mobile access impossible (Tally runs on desktop only)
- Travel/remote work means no access to accounting data
- No read-only mode for viewing reports without Tally
- Data entry while offline not possible

## Proposed Solution
Full offline capability using cached data, with sync queue for changes made offline.

### Key Features
1. **Data Caching**: Store all synced data in IndexedDB for offline access
2. **Offline Reports**: View all reports from cached data
3. **Offline Entry**: Create vouchers offline, queue for sync
4. **Sync Queue**: Visual queue of pending changes with conflict detection
5. **PWA Support**: Install as desktop/mobile app
6. **Smart Sync**: Differential sync — only fetch changes since last sync


## UI — Easy Mode
Offline indicator banner, cached data badge, sync queue panel with pending count, auto-sync on reconnect


## UI — Tally Mode
Offline status in title bar, all keyboard operations work offline, sync queue counter, F5 to force sync when online


## Implementation Steps
1. Set up IndexedDB storage for all data types
2. Implement data caching on every sync
3. Create sync queue manager for offline changes
4. Build offline detection and mode switching
5. Implement differential sync algorithm
6. Add PWA manifest and service worker
7. Build sync queue UI with conflict resolution

## Priority Level
🟡 **High** — Enables mobile/remote access

## Estimated Effort
~12 days
