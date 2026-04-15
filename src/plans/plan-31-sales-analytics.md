# Plan 31: Sales Analytics

## Problem Statement
Tally shows sales data in registers but provides no analytical insights — no trends, no segmentation, no product performance analysis.

## Current Pain Points
- Sales register is a flat list — no trends visible
- Top products/customers analysis requires Excel export
- No seasonal pattern identification
- No salesperson performance tracking
- No product mix or margin analysis

## Proposed Solution
Comprehensive sales analytics with product, customer, geography, and time-based analysis.

### Key Features
1. **Sales Dashboard**: Revenue trend, daily/weekly/monthly views
2. **Product Analysis**: Top sellers, slow movers, margin per product
3. **Customer Segmentation**: High-value, at-risk, new, lost customers
4. **Geography Analysis**: Sales by region/state
5. **Salesperson Performance**: Targets vs actuals per salesperson
6. **Trend Detection**: Identify seasonal patterns and anomalies


## UI — Easy Mode
Interactive sales charts (bar/line/pie), product leaderboard, customer segment cards, trend analysis


## UI — Tally Mode
Sales register summary with grouping options (product/customer/month), F7 for period, F5 for details, columnar Tally format


## Implementation Steps
1. Fetch sales vouchers from Tally with full detail
2. Build aggregation engine (by product, customer, time, geography)
3. Create dashboard with recharts visualizations
4. Implement segmentation algorithms
5. Build trend analysis with period comparisons

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
