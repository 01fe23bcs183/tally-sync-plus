# Plan 58: Session Management & Device Trust

## Problem Statement
Users may log in from multiple devices, share accounts, or leave sessions active on public computers. There's no way to track, limit, or revoke active sessions.

## Current Pain Points
- **No session visibility**: Users can't see where they're logged in
- **No force logout**: Admin can't revoke a compromised session
- **Unlimited sessions**: No limit on concurrent logins
- **No device tracking**: Can't identify which devices have access
- **No timeout policies**: Sessions never expire automatically

## Proposed Solution
Build comprehensive session management with device tracking, configurable timeout policies, IP-based restrictions, and admin controls for force logout and session limits.

## Key Features
1. **Active Sessions List**: Show all active sessions with device info, IP, location
2. **Force Logout**: Revoke any session remotely (user or admin)
3. **Trusted Devices**: Mark devices as trusted to skip 2FA
4. **Session Timeout**: Configurable idle timeout and absolute timeout
5. **IP Restrictions**: Whitelist/blacklist IP ranges
6. **Concurrent Limits**: Max N sessions per user


## UI — Easy Mode
Active sessions list with device icons, force logout buttons, trusted device toggles


## UI — Tally Mode
Session info in status bar, Alt+S to view active sessions list, F5 to logout session, device trust via text menu


## Implementation Steps
1. Build session tracking with device fingerprinting
2. Implement session storage with metadata (IP, UA, geo)
3. Add force logout endpoint (invalidate specific session token)
4. Build trusted device flow with device token
5. Implement configurable timeout policies
6. Add IP-based access rules
7. Build concurrent session limiter
8. Admin dashboard for session management

## Priority Level
🟡 **High** — Important for security compliance.

## Estimated Effort
2 weeks (1 developer)
