# Plan 33: Fund Flow Statement

## Problem Statement
Fund flow statements (sources and uses of funds) are important for financial analysis but Tally doesn't generate them directly.

## Current Pain Points
- Must manually prepare fund flow from balance sheet comparisons
- Working capital changes computation is tedious
- No visual flow diagram
- No period comparison for fund flow
- Schedule of changes requires manual work

## Proposed Solution
Auto-generated fund flow statement with visual flow diagrams and period comparisons.

### Key Features
1. **Auto-Generate**: Compute from comparative balance sheets
2. **Visual Flow**: Sankey diagram showing sources → uses
3. **Working Capital Analysis**: Detailed changes in current assets/liabilities
4. **Period Comparison**: Side-by-side fund flow for multiple periods
5. **Schedule of Changes**: Detailed breakdown of long-term changes


## UI — Easy Mode
Sankey diagram showing fund sources→uses, interactive flow chart, period comparison slider


## UI — Tally Mode
Fund flow statement in Tally's standard format, sources/applications of funds, F7 for period comparison, Alt+P to print


## Implementation Steps
1. Fetch comparative balance sheet data from Tally
2. Build fund flow computation engine
3. Create Sankey diagram component
4. Build detailed schedule views
5. Add period comparison

## Priority Level
🟢 **Low**

## Estimated Effort
~5 days
