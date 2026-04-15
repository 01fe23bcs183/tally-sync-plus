# Plan 57: Two-Factor Authentication (2FA)

## Problem Statement
Financial data access requires strong authentication. Password-only authentication is vulnerable to credential theft, phishing, and brute force attacks.

## Current Pain Points
- **Password-only access**: Single factor is insufficient for financial systems
- **No enforcement**: No way to mandate 2FA for sensitive operations
- **Shared credentials**: Users share passwords, no accountability
- **No recovery**: If password is compromised, no second layer of defense

## Proposed Solution
Implement multi-method 2FA support including TOTP (Google Authenticator), SMS OTP, and email verification. Allow admins to enforce 2FA policies. Include recovery codes for account access.

## Key Features
1. **TOTP Support**: Google Authenticator, Authy, Microsoft Authenticator compatible
2. **SMS OTP**: Send OTP via SMS as alternative 2FA method
3. **Email Verification**: Email-based OTP for additional option
4. **Admin Enforcement**: Require 2FA for all users or specific roles
5. **Recovery Codes**: Generate 10 one-time recovery codes during setup
6. **Mandatory for Sensitive Ops**: Force 2FA re-verification for delete, export, settings changes

## UI Mockup

```
┌───────────────────────────────────┐
│  Two-Factor Authentication  — □ × │
├───────────────────────────────────┤
│                                   │
│  ✅ 2FA is enabled                │
│                                   │
│  Primary Method: Authenticator App│
│  Backup Method:  SMS (+91****1234)│
│                                   │
│  Recovery Codes: 7 remaining      │
│  [View Codes] [Regenerate]        │
│                                   │
│  ─────────────────────────────    │
│  Trusted Devices:                 │
│  • Chrome on Windows (this)       │
│  • Safari on iPhone               │
│  [Manage Devices]                 │
│                                   │
│  [Disable 2FA]                    │
│                                   │
└───────────────────────────────────┘
```


## UI — Easy Mode
2FA setup wizard with QR code, authenticator app link, recovery code cards, trusted device list


## UI — Tally Mode
2FA prompt at login — enter TOTP code after password, F5 to verify, recovery code entry option, standard text input


## Implementation Steps
1. Integrate TOTP library (otpauth/speakeasy)
2. Build QR code generation for authenticator app setup
3. Implement SMS OTP via Twilio/MSG91
4. Build recovery code generation and storage (hashed)
5. Add 2FA enforcement policies for admin
6. Implement re-verification flow for sensitive operations
7. Build trusted device management
8. Add backup method configuration

## Priority Level
🔴 **Critical** — Essential security feature for financial data.

## Estimated Effort
2 weeks (1 developer)
