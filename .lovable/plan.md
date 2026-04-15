

## Tally Integration App — Two-Mode Interface

### Overview
A web app that syncs with Tally Prime (local XML API on port 9000) and provides two switchable modes: **Easy Mode** (modern, visual UI) and **Tally Mode** (keyboard-driven, classic Tally replica).

### Architecture
- **Browser → localhost:9000**: Direct XML API calls to Tally Prime running locally
- **XML Parser Service**: Utility layer to send/receive Tally XML requests and parse responses
- **Local Data Cache**: React Query cache for synced Tally data to avoid repeated fetches
- **Mode Switcher**: Toggle between Easy Mode and Tally Mode (persisted in localStorage)

### Phase 1: Core Infrastructure
- **Tally Connection Manager**: Configure Tally host/port, test connection, show status
- **XML API Service**: Reusable functions for Tally XML request/response (export masters, import vouchers, fetch reports)
- **Data Sync Engine**: Pull company info, ledgers, groups, stock items, vouchers from Tally and cache locally

### Phase 2: Easy Mode (Modern UI)
- **Dashboard**: Company overview with key financial metrics (P&L summary, cash flow, outstanding receivables/payables)
- **Ledger Management**: Card/table view of all ledgers with search, filters, and one-click creation
- **Voucher Entry**: Clean forms for Sales, Purchase, Receipt, Payment, Journal, Contra vouchers with dropdowns and auto-suggestions
- **Inventory View**: Stock items with quantities, rates, godown-wise breakdown
- **Reports**: Balance Sheet, P&L, Trial Balance, Day Book — presented as interactive charts and tables
- **Party Management**: Customer/Supplier profiles with outstanding balances and transaction history

### Phase 3: Tally Mode (Classic Replica)
- **Full keyboard navigation**: All Tally shortcuts (Alt+F5 for Sales, F2 for date, Alt+F1 for detailed view, etc.)
- **Gateway of Tally style menu**: Hierarchical text menu mimicking Tally's navigation
- **Voucher entry screen**: Dr/Cr format with keyboard-driven ledger selection (type-to-search)
- **Report screens**: Text-based columnar reports matching Tally's exact layout
- **No mouse required**: Tab, Enter, Escape, arrow keys for full navigation
- **Blue/cream color scheme** matching Tally Prime's look

### Phase 4: Two-Way Sync
- **Push to Tally**: Create/modify vouchers, ledgers, stock items via XML import
- **Pull from Tally**: Fetch latest data on demand or auto-refresh
- **Conflict detection**: Show warnings when data has changed in Tally since last sync
- **Sync status indicators**: Per-record sync state (synced, pending, error)

### Key Features Across Both Modes
- Mode toggle button (keyboard shortcut: Ctrl+M)
- Real-time connection status indicator
- Company selector (multi-company support)
- Search across all data (Ctrl+F)
- Recent activity timeline

