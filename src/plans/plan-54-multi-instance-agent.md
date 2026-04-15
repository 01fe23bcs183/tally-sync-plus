# Plan 54: Multi-Instance Agent Manager

## Problem Statement
Businesses may run multiple Tally instances — different companies on the same PC, or Tally running on multiple PCs in a LAN. The agent needs to discover and manage all instances.

## Current Pain Points
- **Single instance limit**: Current setup assumes one Tally on localhost:9000
- **Multi-company pain**: Switching companies in Tally requires manual reconfiguration
- **LAN Tally access**: Can't connect to Tally running on another machine in the network
- **No discovery**: User must manually enter Tally connection details

## Proposed Solution
Build a multi-instance manager that can discover Tally instances on the local machine and LAN, manage concurrent connections, and route data per company to the correct cloud workspace.

## Key Features
1. **Auto-Discovery**: Scan localhost and LAN for Tally XML API endpoints
2. **Multi-Connection**: Maintain simultaneous connections to multiple Tally instances
3. **Company Routing**: Route each company's data to the correct cloud workspace
4. **Connection Pool**: Manage connection lifecycle, health, and reconnection per instance
5. **Priority Queue**: Prioritize sync for the active/primary Tally instance
6. **Instance Dashboard**: Visual overview of all connected Tally instances

## UI Mockup

```
┌─────────────────────────────────────────┐
│  Tally Instances                  — □ × │
├─────────────────────────────────────────┤
│                                         │
│  [Scan Network]  [Add Manual]           │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ● localhost:9000                    ││
│  │   Company: ABC Traders Pvt Ltd     ││
│  │   Status: Syncing | Last: 5s ago   ││
│  │   [Pause] [Settings] [Disconnect]  ││
│  ├─────────────────────────────────────┤│
│  │ ● 192.168.1.105:9000               ││
│  │   Company: XYZ Industries          ││
│  │   Status: Connected | Last: 12s    ││
│  │   [Pause] [Settings] [Disconnect]  ││
│  ├─────────────────────────────────────┤│
│  │ ○ 192.168.1.110:9000               ││
│  │   Status: Tally Not Running        ││
│  │   [Retry] [Remove]                 ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```


## UI — Easy Mode
Instance cards with connection status, network scan button, company routing config panel


## UI — Tally Mode
Multi-instance managed via agent UI — Tally Mode auto-connects to correct company data, Alt+F3 shows all instances


## Implementation Steps
1. Build network scanner for Tally XML API endpoints (port 9000)
2. Implement connection pool with per-instance state management
3. Build company detection from Tally response headers
4. Create routing logic to map companies to cloud workspaces
5. Implement priority queue for multi-instance sync
6. Build instance dashboard UI
7. Add manual instance addition with custom host:port
8. LAN discovery using mDNS/broadcast

## Priority Level
🟡 **Medium** — Important for multi-company and multi-location setups.

## Estimated Effort
2 weeks (1 developer)
