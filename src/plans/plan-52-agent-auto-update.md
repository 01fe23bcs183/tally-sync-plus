# Plan 52: Agent Auto-Update & Health Monitor

## Problem Statement
Once the sync agent is deployed to hundreds of user PCs, keeping it updated and monitoring its health becomes critical. Users won't manually update the agent, and crashes or connectivity issues can go unnoticed for days.

## Current Pain Points
- **No auto-update mechanism**: Desktop apps get outdated quickly
- **Silent failures**: Agent could crash and no one notices data stops syncing
- **No visibility**: Admin has no way to know which agents are healthy
- **Manual troubleshooting**: Users can't diagnose agent issues themselves
- **Version fragmentation**: Different users on different versions causes bugs

## Proposed Solution
Build an auto-update system using electron-updater with a health monitoring layer that reports agent status to the cloud. Include crash recovery, self-healing, and a diagnostic tool.

## Key Features
1. **Auto-Update**: Check for updates on startup and periodically. Download and install silently. Rollback on failure.
2. **Health Checks**: Periodic self-checks (Tally reachable? Cloud reachable? Memory usage OK? Disk space?)
3. **Heartbeat**: Send heartbeat to cloud every 60 seconds. Cloud alerts admin if heartbeat stops.
4. **Crash Recovery**: Auto-restart on crash. Log crash details. Send crash report to cloud.
5. **Diagnostic Tool**: Built-in diagnostics — test Tally connection, test cloud connection, check ports, check firewall.
6. **Log Management**: Rotating log files, configurable log level, upload logs to cloud for support.

## UI Mockup (Health Dashboard)

```
┌─────────────────────────────────────┐
│  Agent Health Monitor         — □ × │
├─────────────────────────────────────┤
│                                     │
│  Overall Status: ● Healthy          │
│                                     │
│  ┌─────────────┬──────────┬───────┐ │
│  │ Component   │ Status   │ Last  │ │
│  ├─────────────┼──────────┼───────┤ │
│  │ Tally Conn  │ ● OK     │ 5s    │ │
│  │ Cloud Conn  │ ● OK     │ 3s    │ │
│  │ Memory      │ ● 45MB   │ now   │ │
│  │ Disk Space  │ ● 2.1GB  │ 1m    │ │
│  │ CPU Usage   │ ● 2%     │ now   │ │
│  │ Sync Queue  │ ● Empty  │ 10s   │ │
│  └─────────────┴──────────┴───────┘ │
│                                     │
│  Version: 1.2.3 (latest)            │
│  Uptime: 4 days, 7 hours            │
│                                     │
│  [Run Diagnostics] [Upload Logs]    │
│                                     │
└─────────────────────────────────────┘
```


## UI — Easy Mode
Health dashboard with component status cards, update notification banner, diagnostic button


## UI — Tally Mode
Agent health check runs in background — Tally Mode shows agent status in bottom status bar, Alt+H for health details


## Implementation Steps
1. Integrate electron-updater with GitHub Releases or custom update server
2. Build health check module (Tally ping, cloud ping, system resources)
3. Implement heartbeat system with cloud endpoint
4. Add crash handler with auto-restart (child_process or pm2-like)
5. Build diagnostic tool UI
6. Implement log rotation and cloud upload
7. Add admin dashboard widget for agent fleet health
8. Version management and rollback capability

## Priority Level
🟡 **High** — Essential for production deployment at scale.

## Estimated Effort
2 weeks (1 developer)
