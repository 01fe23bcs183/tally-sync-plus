# Plan 37: Search Everything

## Problem Statement
Finding specific data in Tally requires knowing which report to open. There's no universal search across all data types.

## Current Pain Points
- Must navigate to specific report to find data
- No cross-module search (search vouchers AND ledgers AND stock)
- No fuzzy search or natural language queries
- Recent items not easily accessible
- No search history or suggestions

## Proposed Solution
Global search (Ctrl+K) that searches across all Tally data with instant results, categories, and natural language support.

### Key Features
1. **Global Search Bar**: Ctrl+K opens search overlay
2. **Cross-Module**: Search ledgers, vouchers, stock items, reports simultaneously
3. **Fuzzy Matching**: Find "Raj" when searching "raj traders"
4. **Categorized Results**: Group results by type (Ledger, Voucher, Stock, Report)
5. **Natural Language**: "sales to raj traders in april" → relevant vouchers
6. **Search History**: Recent searches and frequently accessed items
7. **Quick Actions**: From search results, directly open, edit, or create related items

## UI Mockup
```
┌──────────────────────────────────────┐
│ 🔍 Search everything... (Ctrl+K)    │
├──────────────────────────────────────┤
│ Results for "raj traders":           │
│                                      │
│ 📋 Ledgers                          │
│   Raj Traders — Sundry Debtors      │
│                                      │
│ 📄 Vouchers (12 results)            │
│   SV-042 Sales ₹5,900 15-Apr       │
│   RV-018 Receipt ₹10,000 10-Apr    │
│                                      │
│ 📊 Reports                          │
│   Raj Traders — Ledger Account      │
│   Outstanding — Raj Traders         │
│                                      │
│ ⚡ Quick Actions                    │
│   [New Sale to Raj] [View Balance]  │
└──────────────────────────────────────┘
```


## UI — Easy Mode
Ctrl+K spotlight search with categorized results, recent searches, preview panel, filter chips


## UI — Tally Mode
Alt+F global search prompt, results list with type indicators (L=Ledger, V=Voucher, S=Stock), Enter to open, Esc to close


## Implementation Steps
1. Build search index from all synced Tally data
2. Implement fuzzy search with scoring (fuse.js)
3. Create search overlay component (Ctrl+K)
4. Categorize and rank results
5. Add quick actions per result type
6. Implement search history and suggestions

## Priority Level
🔴 **Critical** — Major UX improvement

## Estimated Effort
~6 days
