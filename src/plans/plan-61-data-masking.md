# Plan 61: Sensitive Data Masking

## Problem Statement
Not all users should see all financial data. Junior staff viewing reports shouldn't see exact amounts, bank details, or party contact information. Current systems show everything to everyone.

## Current Pain Points
- **Full data exposure**: All users see all financial details
- **Screenshot risk**: Sensitive data visible on screen can be photographed
- **Demo challenges**: Can't show app to prospects without exposing real data
- **Role mismatch**: Data entry staff can see strategic financial information

## Proposed Solution
Implement configurable data masking that hides or obfuscates sensitive fields based on user role. Support field-level masking rules, unmask-on-demand with authorization, and demo mode with synthetic data.

## Key Features
1. **Field-Level Masking**: Configure which fields are masked per role
2. **Masking Types**: Full mask (****), partial (₹XX,XX,234), blur, hide
3. **Unmask on Demand**: Click to unmask with re-authentication
4. **Demo Mode**: Replace all data with realistic synthetic data
5. **Masking Rules**: Conditional masking (mask amounts > ₹1L, mask specific parties)
6. **Audit Unmask**: Log every unmask action

## Implementation Steps
1. Define masking rule schema (field, role, mask type, conditions)
2. Build masking middleware for API responses
3. Implement client-side masking renderer
4. Add unmask flow with re-authentication
5. Build demo mode data generator
6. Create masking rule management UI
7. Log all unmask actions to audit trail

## Priority Level
🟡 **Medium** — Important for enterprise role-based access.

## Estimated Effort
2 weeks (1 developer)
