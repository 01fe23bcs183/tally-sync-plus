# Plan 51: Tally Sync Agent (Desktop Service)

## Problem Statement
Currently, the web app connects directly to Tally's XML API on localhost:9000. This only works when the user has both the browser and Tally open on the same machine. There's no way to access Tally data remotely, from mobile, or when the user is away from the Tally PC.

## Current Pain Points
- **Local-only access**: Must be on the same PC as Tally to use the app
- **No remote access**: Can't check reports from phone or another location
- **Manual sync**: User must explicitly trigger data refresh
- **No background processing**: Data only flows when the app is open
- **Single user bottleneck**: Only one person can access Tally data at a time

## Proposed Solution
Build a lightweight desktop agent (Electron/Node.js) that runs as a system tray application. It connects to the local Tally XML API, extracts data, and pushes it to the cloud server via WebSocket/REST API. This enables remote access, multi-user support, and continuous sync.

## Key Features
1. **System Tray App**: Minimizes to tray, runs in background, auto-starts on boot
2. **Tally Connection Manager**: Auto-detect Tally on localhost:9000, test connection, retry on failure
3. **Cloud Push**: Authenticate with cloud server, push data via REST/WebSocket
4. **Sync Queue**: Queue changes when offline, push when reconnected
5. **Status Dashboard**: Show sync status, last sync time, pending items, errors
6. **Installer**: One-click installer for Windows (MSI/NSIS), auto-create startup entry

## UI Mockup (System Tray)

```
┌─────────────────────────────┐
│  TallySync Agent      — □ × │
├─────────────────────────────┤
│                             │
│  Tally Status: ● Connected  │
│  Cloud Status: ● Connected  │
│                             │
│  Last Sync: 2 min ago       │
│  Pending:   0 items         │
│  Errors:    0               │
│                             │
│  Company: ABC Traders Pvt.  │
│                             │
│  [Sync Now]  [View Logs]    │
│                             │
│  ─────────────────────────  │
│  Today's Activity:          │
│  ✓ 45 vouchers synced       │
│  ✓ 3 ledgers updated        │
│  ✓ 12 stock items refreshed │
│                             │
└─────────────────────────────┘
```

### Tray Menu
```
┌──────────────────────┐
│ ● TallySync Active   │
├──────────────────────┤
│ Sync Now             │
│ Open Dashboard       │
│ View Logs            │
│ ──────────────────── │
│ Settings             │
│ Check for Updates    │
│ ──────────────────── │
│ Quit                 │
└──────────────────────┘
```

## Architecture

```
┌──────────┐     XML/HTTP      ┌──────────────┐    REST/WS     ┌─────────────┐
│  Tally   │ ◄──────────────► │  Sync Agent   │ ────────────► │ Cloud Server │
│  Prime   │   localhost:9000  │  (Electron)   │   HTTPS/WSS   │  (Backend)   │
└──────────┘                   └──────────────┘                └─────────────┘
                                     │                              │
                                System Tray                    ┌─────────────┐
                                                               │   Web App   │
                                                               │  (Browser)  │
                                                               └─────────────┘
```

## Data Flow
1. Agent polls Tally XML API at configured intervals (default: 30 seconds)
2. Compares response hash with last known state
3. If changed, extracts delta and queues for cloud push
4. Pushes to cloud via authenticated REST API or WebSocket
5. Cloud processes and stores data
6. Web app receives real-time updates via WebSocket subscription

## Implementation Steps
1. Set up Electron project with system tray support
2. Build Tally XML connector (reuse existing `tallyXmlService.ts` logic)
3. Implement cloud authentication (JWT-based)
4. Build REST/WebSocket push client
5. Create sync queue with IndexedDB persistence
6. Build system tray UI with status indicators
7. Add Windows installer (electron-builder/NSIS)
8. Add auto-start on boot capability
9. Build settings UI (sync interval, company selection, cloud URL)
10. Integration testing with real Tally instance

## Tech Stack
- **Electron** for desktop app shell
- **Node.js** for Tally XML communication
- **WebSocket (ws)** for real-time cloud push
- **electron-store** for local config persistence
- **electron-updater** for auto-updates
- **NSIS** for Windows installer

## Priority Level
🔴 **Critical** — This is the foundational piece that enables remote access and multi-user support.

## Estimated Effort
3-4 weeks (1 developer)

## Dependencies
- Cloud backend must be set up first (API endpoints for receiving data)
- Authentication system (Plan 57: 2FA)
- Tally XML API knowledge (existing)
