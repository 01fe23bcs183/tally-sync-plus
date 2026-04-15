# Plan 79: Automated Report Scheduling & Email

## Problem Statement
Business owners and managers need regular reports — daily sales, weekly outstanding, monthly P&L. Currently, someone must manually generate and email these reports every time.

## Current Pain Points
- **Manual report generation**: Someone runs the report every day/week/month
- **Manual email**: Copy report and email to stakeholders
- **Missed reports**: If the person is absent, reports don't go out
- **No consistency**: Report format/timing varies
- **Time waste**: 30-60 minutes daily just generating and sending reports

## Proposed Solution
Build a report scheduling system where users define which reports to generate, when, in what format, and to whom. The system auto-generates and emails reports on schedule.

## Key Features
1. **Schedule Builder**: Select report, frequency, time, format (PDF/Excel)
2. **Recipient List**: Define who receives each report
3. **Auto-Generate**: System generates report at scheduled time
4. **Multi-Format**: PDF, Excel, CSV, or inline email
5. **Conditional Reports**: Only send if data meets conditions (e.g., outstanding > ₹1L)
6. **Report History**: View all sent reports with delivery status


## UI — Easy Mode
Schedule builder with calendar, recipient picker, format selector, delivery history list


## UI — Tally Mode
Alt+S to schedule current report, schedule list with cron-style timing, F5 to edit schedule, delivery log register


## Implementation Steps
1. Build schedule definition UI (report, frequency, recipients)
2. Create cron-based scheduler engine
3. Implement report generation service (reuse existing report components)
4. Build PDF/Excel export for each report type
5. Implement email delivery system
6. Add conditional send logic
7. Build report history and delivery tracking
8. Add failure retry and admin alerts

## Priority Level
🟡 **Medium** — Great time-saver for regular reporting.

## Estimated Effort
2 weeks (1 developer)
