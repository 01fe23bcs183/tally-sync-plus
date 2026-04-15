# Plan 48: User Roles & Access Control

## Problem Statement
In multi-user setups, not everyone should have access to all data and features. Tally has basic security but it's complex to configure.

## Current Pain Points
- Tally's security levels are confusing to set up
- Cannot restrict by voucher type or report
- No role templates (accountant, viewer, manager, admin)
- Activity per user is not easily tracked
- Password sharing is common because role setup is hard

## Proposed Solution
Simple role-based access control with pre-defined templates and granular permissions.

### Key Features
1. **Role Templates**: Admin, Accountant, Data Entry, Viewer (read-only), Approver
2. **Granular Permissions**: By module (vouchers, reports, masters), by action (view, create, edit, delete)
3. **Data Restrictions**: Limit access by company, date range, or amount threshold
4. **Login System**: User authentication with session management
5. **Permission Inheritance**: Group-based permissions with individual overrides


## UI — Easy Mode
Role management cards with permission toggles, user list with role badges, access matrix grid


## UI — Tally Mode
User role register, F5 to assign role, permission list with Y/N toggles, Alt+U for user list, role-based menu filtering


## Implementation Steps
1. Design permission schema (module × action × data scope)
2. Build role management UI
3. Create permission checking middleware
4. Implement login/session system
5. Build user management (invite, deactivate)
6. Add permission checks throughout the app

## Priority Level
🟡 **High** — Required for team use

## Estimated Effort
~10 days
