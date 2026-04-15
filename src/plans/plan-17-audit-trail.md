# Plan 17: Audit Trail & Compliance

## Problem Statement
Companies Act 2013 mandates audit trail for accounting software. Tally Prime added this in recent versions, but the interface is limited and hard to review.

## Current Pain Points
- Tally's audit trail view is text-heavy and hard to navigate
- No easy way to filter changes by user, date, or type
- Cannot export audit trail in a structured format
- No visual diff of before/after changes
- Auditors struggle to review changes efficiently

## Proposed Solution
Visual audit trail with advanced filtering, diff views, and auditor-friendly export.

### Key Features
1. **Change Timeline**: Visual timeline of all changes with filters
2. **Diff View**: Side-by-side before/after comparison for each change
3. **User Tracking**: Filter changes by user who made them
4. **Export for Auditors**: Excel/PDF export with structured format
5. **Tamper Detection**: Hash-based verification of audit trail integrity
6. **Compliance Dashboard**: Show compliance status with regulatory requirements

## Implementation Steps
1. Fetch audit trail data from Tally (if available via XML)
2. Build our own change tracking layer for app-level changes
3. Create timeline UI with advanced filters
4. Implement diff view component
5. Build export engine (Excel, PDF)
6. Add integrity verification

## Priority Level
🟡 **High** — Legal compliance

## Estimated Effort
~7 days
