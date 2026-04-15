# Plan 55: Agent Configuration & Remote Control

## Problem Statement
Once agents are deployed across multiple PCs, admins need a way to configure and control them remotely without physically accessing each machine.

## Current Pain Points
- **No remote management**: Must sit at each PC to change agent settings
- **No fleet visibility**: Can't see status of all agents from one place
- **Configuration drift**: Different agents may have different settings
- **No remote troubleshooting**: Can't restart or diagnose agents remotely

## Proposed Solution
Build a web-based admin dashboard for managing all deployed agents. Agents maintain a WebSocket connection to the cloud and accept configuration commands. Admins can view status, change settings, restart agents, and pull logs — all from the browser.

## Key Features
1. **Agent Fleet Dashboard**: See all agents, their status, version, last sync time
2. **Remote Configuration**: Push config changes (sync interval, data types, company selection)
3. **Remote Restart**: Restart agent process without physical access
4. **Log Viewer**: Pull and view agent logs in real-time from the dashboard
5. **Bulk Actions**: Update config or restart multiple agents at once
6. **Alert Rules**: Set up alerts for agent disconnection, errors, or sync delays

## UI Mockup (Web Dashboard)

```
┌──────────────────────────────────────────────────────┐
│  Agent Management Dashboard                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Total Agents: 12 | Online: 10 | Offline: 2         │
│                                                      │
│  ┌──────────┬──────────┬─────────┬────────┬────────┐ │
│  │ Agent    │ Status   │ Version │ Last   │ Actions│ │
│  ├──────────┼──────────┼─────────┼────────┼────────┤ │
│  │ PC-001   │ ● Online │ 1.2.3   │ 3s ago │ ⚙ ↻ 📋│ │
│  │ PC-002   │ ● Online │ 1.2.3   │ 5s ago │ ⚙ ↻ 📋│ │
│  │ PC-003   │ ○ Offline│ 1.2.1   │ 2h ago │ ⚙ - 📋│ │
│  │ PC-004   │ ● Online │ 1.2.3   │ 1s ago │ ⚙ ↻ 📋│ │
│  └──────────┴──────────┴─────────┴────────┴────────┘ │
│                                                      │
│  [Push Update to All] [Bulk Config] [Export Report]  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Implementation Steps
1. Build WebSocket command channel (cloud → agent)
2. Implement command handlers in agent (restart, update-config, send-logs)
3. Build fleet dashboard UI in web app
4. Add config push with validation and rollback
5. Implement bulk action system
6. Build alert/notification system for agent health
7. Add agent grouping and tagging
8. Role-based access for agent management

## Priority Level
🟡 **Medium** — Needed for enterprise deployments with multiple agents.

## Estimated Effort
2-3 weeks (1 developer)
