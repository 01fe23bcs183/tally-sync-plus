# Plan 53: Real-Time Data Streaming

## Problem Statement
Polling Tally at fixed intervals means data can be stale. When a voucher is entered in Tally, it may take 30+ seconds to appear in the web app. For real-time collaboration and monitoring, we need instant data streaming.

## Current Pain Points
- **Stale data**: Fixed polling intervals mean delayed visibility
- **Wasted resources**: Polling even when nothing has changed
- **No change detection**: Can't tell what specifically changed between polls
- **Bandwidth waste**: Fetching entire datasets when only one record changed
- **No event system**: No way to trigger actions based on Tally changes

## Proposed Solution
Implement an event-driven data streaming system in the agent. Use Tally's XML API with smart diffing to detect changes, then stream only deltas to the cloud via WebSocket. Support change events that the web app can subscribe to.

## Key Features
1. **Smart Diff Engine**: Hash-based comparison of Tally data to detect changes
2. **Delta Streaming**: Send only changed records, not full datasets
3. **Change Events**: Emit typed events (VOUCHER_CREATED, LEDGER_UPDATED, STOCK_CHANGED)
4. **WebSocket Streaming**: Persistent WebSocket connection to cloud for real-time push
5. **Backpressure Handling**: Queue management when cloud is slow or offline
6. **Selective Sync**: Configure which data types to stream in real-time vs batch

## Architecture

```
Tally XML API
     │
     ▼
┌────────────────┐
│  Poll Module   │ (configurable interval per data type)
│  - Vouchers: 5s│
│  - Ledgers: 30s│
│  - Stock: 15s  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Diff Engine   │ (hash comparison, field-level diff)
│  - Last state  │
│  - New state   │
│  - Delta calc  │
└───────┬────────┘
        │ (only if changed)
        ▼
┌────────────────┐
│  Event Emitter │ (typed change events)
│  VOUCHER_CREATED│
│  LEDGER_UPDATED │
│  STOCK_CHANGED  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  WebSocket TX  │ (persistent connection to cloud)
│  - Auto-reconnect│
│  - Queue on fail │
│  - Batch sends   │
└────────────────┘
```

## Implementation Steps
1. Build hash-based state tracker for each data type
2. Implement field-level diff algorithm
3. Create typed event system (EventEmitter pattern)
4. Build WebSocket client with auto-reconnect
5. Implement backpressure queue with IndexedDB persistence
6. Add configurable polling intervals per data type
7. Build cloud-side WebSocket receiver and event dispatcher
8. Web app subscribes to real-time events via cloud WebSocket
9. Add bandwidth monitoring and optimization

## Priority Level
🟡 **High** — Key differentiator for real-time experience.

## Estimated Effort
2-3 weeks (1 developer)
