# Plan 44: Excel/Google Sheets Sync

## Problem Statement
Most accountants and business owners live in Excel. Moving data between Tally and Excel is a constant friction point.

## Current Pain Points
- Exporting from Tally to Excel loses formatting
- Importing from Excel to Tally requires XML conversion
- No live connection between Excel and Tally data
- Pivot table analysis requires manual data refresh
- Google Sheets collaboration not possible with Tally data

## Proposed Solution
Bi-directional Excel/Sheets sync with live data connection and formatted exports.

### Key Features
1. **Smart Export**: Export any report/data to formatted Excel (with headers, totals, colors)
2. **Excel Import**: Import data from Excel with column mapping (→ Plan 02)
3. **Live Connection**: Google Sheets add-on that pulls live Tally data
4. **Template Exports**: Pre-formatted Excel templates for specific reports
5. **Scheduled Sync**: Auto-export reports to Sheets at set intervals


## UI — Easy Mode
Live connection panel with sync status, field mapping UI, export/import buttons with format preview


## UI — Tally Mode
Alt+X to export current view to Excel, F5 to import, mapping screen with Tab navigation, sync status in status bar


## Implementation Steps
1. Build Excel export engine using SheetJS (with formatting)
2. Create report-to-Excel template mapper
3. Build Google Sheets API integration
4. Implement scheduled export system
5. Create import workflow (reuse Plan 02 infrastructure)

## Priority Level
🟡 **High**

## Estimated Effort
~7 days
