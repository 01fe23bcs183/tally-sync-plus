# Plan 28: Ratio Analysis Dashboard

## Problem Statement
Financial ratio analysis requires extracting numbers from multiple Tally reports and manually computing ratios. No integrated dashboard exists.

## Current Pain Points
- Must extract data from Balance Sheet, P&L, and other reports separately
- Ratio computation is manual
- No trend tracking of ratios over time
- No industry benchmark comparison
- Difficult for non-accountants to interpret

## Proposed Solution
Auto-computed financial ratios with trend charts, benchmarks, and plain-English explanations.

### Key Features
1. **Auto-Computed Ratios**: Current ratio, quick ratio, debt-equity, ROE, ROA, gross margin, net margin, etc.
2. **Trend Charts**: Track each ratio over quarters/years
3. **Health Score**: Overall financial health score based on key ratios
4. **Plain-English Insights**: "Your current ratio of 2.1 means you can cover short-term obligations"
5. **Benchmark Comparison**: Compare against industry averages

## Implementation Steps
1. Fetch Balance Sheet and P&L data from Tally
2. Build ratio computation engine (20+ ratios)
3. Create dashboard with gauge and trend charts
4. Write insight generator (rule-based)
5. Add industry benchmark data

## Priority Level
🟡 **Medium**

## Estimated Effort
~6 days
