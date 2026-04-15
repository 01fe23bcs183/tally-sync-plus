# Plan 60: API Security & Rate Limiting

## Problem Statement
The agent-to-server and client-to-server APIs need robust security to prevent abuse, unauthorized access, and DDoS attacks.

## Current Pain Points
- **No rate limiting**: APIs can be hammered without restriction
- **No request signing**: Can't verify request authenticity
- **No API versioning**: Breaking changes affect all clients
- **No abuse detection**: No way to identify malicious API usage

## Proposed Solution
Implement comprehensive API security: API key management, request signing (HMAC), rate limiting per key/IP, IP whitelisting for agents, API versioning, and abuse detection with auto-blocking.

## Key Features
1. **API Key Management**: Generate, rotate, revoke API keys per agent/user
2. **Request Signing**: HMAC-SHA256 signing for agent requests
3. **Rate Limiting**: Per-key and per-IP rate limits with sliding window
4. **IP Whitelisting**: Restrict agent API access to known IPs
5. **API Versioning**: Version headers, deprecation notices, migration guides
6. **Abuse Detection**: Pattern detection, auto-block, alert admin


## UI — Easy Mode
API key management cards, rate limit gauges, security dashboard with charts


## UI — Tally Mode
API security managed via admin panel in Easy Mode — Tally Mode uses secure API automatically, no user-facing changes


## Implementation Steps
1. Build API key generation and management system
2. Implement HMAC request signing and verification
3. Add Redis-based sliding window rate limiter
4. Build IP whitelist/blacklist management
5. Implement API versioning middleware
6. Build abuse detection engine
7. Admin dashboard for API key and security management
8. Documentation and SDK updates

## Priority Level
🟡 **High** — Essential for production API security.

## Estimated Effort
2 weeks (1 developer)
