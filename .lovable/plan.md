

# Plans 101–150: Tally Mode — Exact Tally Prime Replica

## Core Principle
Tally Mode must replicate **real Tally Prime** exactly — same menus, same screens, same keyboard shortcuts, same visual layout. No Easy Mode features bleed in. If Tally Prime doesn't have a "Stock Aging Dashboard" or "Reorder Alert Widget," neither does Tally Mode.

Both modes share the same data layer (services + React Query hooks), but Tally Mode only exposes what real Tally Prime exposes.

## What Real Tally Prime Has (and what we replicate)

### Gateway of Tally
- Masters (Accounts Info, Inventory Info)
- Vouchers (Accounting/Inventory vouchers)
- Reports (Books & Registers, Statements of Accounts, Statutory Reports)
- Display (Balance Sheet, P&L, Stock Summary, Ratio Analysis, Cash/Fund Flow)
- Alter/Create company info
- F11 (Features), F12 (Configuration)

### NOT in Tally Prime (remove from plans)
- Dashboards, charts, analytics widgets
- Reorder alert cards, batch expiry cards
- Custom report builders
- Budget variance charts
- Any "enhanced" or "modern" UI concept

## Revised Plan Breakdown

### Foundation (101–105)
| # | What |
|---|------|
| 101 | **Keyboard hook** — `useTallyKeyboard.ts`: arrow nav, Enter select, Esc back, letter jump, F-key shortcuts (matching real Tally Prime keys) |
| 102 | **Screen stack router** — Push/pop navigation with breadcrumb (like Tally's drill-down: Gateway → Trial Balance → Ledger → Voucher) |
| 103 | **Gateway of Tally** — Exact Tally Prime gateway layout: left panel (company info, date, licensed to), right panel (menu tree: Masters, Transactions, Reports, Quit) |
| 104 | **TallyTable component** — Reusable columnar display: blue bg, yellow headers, border lines, keyboard row highlight, page up/down scrolling |
| 105 | **TallyForm component** — Field-by-field entry: Tab/Enter moves forward, type-ahead autocomplete for ledger/stock names, Esc cancels |

### Masters (106–113) — Tally Prime's "Create/Alter/Display" pattern
| # | What |
|---|------|
| 106 | **Ledger Create/Alter/Display** — Name, Under (group), Opening Balance, address fields. List view with search. |
| 107 | **Group Create/Alter/Display** — Group name, Under (parent), Nature of Group |
| 108 | **Stock Item Create/Alter/Display** — Name, Under (stock group), Units, Opening balance/rate/value |
| 109 | **Stock Group Create/Alter/Display** — Name, Under parent |
| 110 | **Unit of Measure Create/Alter** — Simple unit, compound unit (e.g., Box of 10 Nos) |
| 111 | **Godown Create/Alter/Display** — Name, Under parent godown |
| 112 | **Cost Centre Create/Alter/Display** — Name, Under category |
| 113 | **Voucher Type Alter** — View/modify voucher type settings |

### Voucher Entry (114–120) — Exact Tally Prime voucher screens
| # | What |
|---|------|
| 114 | **Sales Voucher (F8)** — Party A/c, Sales ledger, item-wise/ledger-wise entry, Dr/Cr amounts, Narration. Ctrl+A to accept. |
| 115 | **Purchase Voucher (F9)** — Same layout as Sales, different defaults |
| 116 | **Payment Voucher (F5)** — Cash/Bank Dr, party Cr, amount, narration |
| 117 | **Receipt Voucher (F6)** — Party Dr, Cash/Bank Cr |
| 118 | **Journal Voucher (F7)** — Multi-line Dr/Cr entry |
| 119 | **Contra Voucher (F4)** — Cash-to-bank / bank-to-cash |
| 120 | **Debit Note / Credit Note (Ctrl+F9/Ctrl+F8)** — Note entry with original ref |

### Books & Registers (121–126)
| # | What |
|---|------|
| 121 | **Day Book** — All vouchers for a date/period, drill-down to voucher detail |
| 122 | **Cash Book / Bank Book** — Running balance for cash/bank ledgers |
| 123 | **Purchase Register / Sales Register** — Voucher list filtered by type |
| 124 | **Journal Register** — Journal entries list |
| 125 | **Ledger Account** — Single ledger's voucher list with running balance (drill-down from any report) |
| 126 | **Voucher Detail View** — Full voucher display with all entries, used for drill-down |

### Statements of Accounts (127–132)
| # | What |
|---|------|
| 127 | **Trial Balance** — Enhanced existing: add drill-down to group → ledger → vouchers |
| 128 | **Balance Sheet** — Liabilities left, Assets right (or vertical), grouped with sub-totals, drill-down |
| 129 | **Profit & Loss Account** — Income vs Expenses, grouped, drill-down |
| 130 | **Outstanding Receivables** — Party-wise pending bills with aging |
| 131 | **Outstanding Payables** — Same for payables |
| 132 | **Group Summary / Group Vouchers** — Group-level totals, drill to ledgers within |

### Inventory Reports (133–137)
| # | What |
|---|------|
| 133 | **Stock Summary** — Enhanced existing: group drill-down, godown toggle |
| 134 | **Stock Item Report** — Single item movement: inward/outward/closing |
| 135 | **Godown Summary** — Stock by godown |
| 136 | **Stock Category Summary** — Category-wise totals |
| 137 | **Movement Analysis** — Item-wise inward/outward for period |

### Statutory Reports (138–142) — What Tally Prime actually shows
| # | What |
|---|------|
| 138 | **GSTR-1 / GSTR-3B** — Summary tables (not a dashboard, just Tally's statutory report view) |
| 139 | **TDS Reports** — Computation, challan, deductee summary (Tally's format) |
| 140 | **TCS Reports** — Similar to TDS |
| 141 | **GST Payment** — Tax liability summary |
| 142 | **Statutory Ledger** — Party-wise statutory details view |

### Display & Utilities (143–150)
| # | What |
|---|------|
| 143 | **Cash Flow Statement** — Tally's standard cash flow (Operating/Investing/Financing) |
| 144 | **Fund Flow Statement** — Sources and applications of funds |
| 145 | **Ratio Analysis** — Tally's built-in financial ratios display |
| 146 | **Bank Reconciliation Statement** — BRS with reconciled date entry |
| 147 | **Interest Calculation** — Simple/compound interest on outstanding bills |
| 148 | **Bill-wise Details** — Pending bills register for a party |
| 149 | **Company Info (Alt+F3)** — Create/Alter/Select company |
| 150 | **F11 Features / F12 Configuration** — Toggle features on/off (like real Tally's feature screens) |

## Shared Data Architecture

```text
┌─────────────────────────────┐
│   services/ + useTallyData  │  ← Single source of truth
└──────┬──────────────┬───────┘
       │              │
  Easy Mode       Tally Mode
  (cards,tabs,    (monospace,
   charts)         tables,
                   keyboard)
```

- Same `useLedgers()`, `useVouchers()`, `useStockItems()` hooks
- Tally Mode components live in `src/components/tally/screens/`
- No new services needed — just new view components

## Visual Rules (match real Tally Prime)
- Background: `#1a3a5c` (dark blue)
- Headers/titles: `#ffeb3b` (yellow)
- Text: `#e0e0e0` (light gray)
- Selected row: `#4a6fa5` (brighter blue)
- Borders: `#3a5a8a`
- Font: monospace, 13-14px
- Top bar: company name + current date + period
- Bottom bar: F1–F10 function key labels (context-sensitive)

## Implementation Order
1. Foundation (101–105) — must come first
2. Gateway + Masters (103, 106–113) — menu and data entry
3. Voucher Entry (114–120) — core transaction screens
4. Reports (121–150) — all display screens

