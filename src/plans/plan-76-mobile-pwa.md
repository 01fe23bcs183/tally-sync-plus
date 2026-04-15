# Plan 76: Mobile App (PWA)

## Problem Statement
Business owners need to check reports, approve transactions, and make quick entries on the go. Tally has no mobile app. Our web app may work on mobile but isn't optimized for it.

## Current Pain Points
- **No mobile access**: Tally is desktop-only
- **Can't check on the go**: Business owners can't see outstanding, cash position from phone
- **No quick entry**: Can't make a quick receipt/payment entry while traveling
- **No notifications**: Don't know about important events until back at desk

## Proposed Solution
Build a Progressive Web App (PWA) optimized for mobile. Focus on read-heavy use cases (reports, dashboards), quick data entry, push notifications, and camera-based document capture.

## Key Features
1. **Mobile Dashboard**: Key metrics — cash balance, receivables, today's sales
2. **Quick Entry**: Simplified voucher entry for receipt/payment
3. **Report Viewer**: P&L, Balance Sheet, Outstanding — touch-optimized
4. **Push Notifications**: Alerts for cheque maturity, overdue payments, stock alerts
5. **Camera Entry**: Photo-to-voucher with OCR (Plan 66)
6. **Offline Support**: View cached reports without internet
7. **Approve/Reject**: Review and approve pending vouchers


## UI — Easy Mode
Mobile-optimized dashboard with swipe navigation, quick entry forms, push notification badges


## UI — Tally Mode
PWA is Easy Mode only — designed for mobile-first experience with touch-optimized controls and simplified navigation


## Implementation Steps
1. Optimize responsive layout for mobile viewports
2. Build mobile-specific dashboard with key KPIs
3. Create simplified quick entry forms
4. Implement PWA manifest and service worker
5. Add push notification support (Firebase/Web Push)
6. Build offline cache for recent reports
7. Implement approval workflow
8. Add home screen install prompt

## Priority Level
🟡 **High** — Business owners want mobile access.

## Estimated Effort
4 weeks (1 developer)
