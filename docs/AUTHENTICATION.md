# Authentication Architecture

## Overview

The frontend authenticates through the `/api/auth` endpoints and keeps the returned access token in browser storage under `ts_token`. Protected API requests send the token as a Bearer credential.

## Login flow

```text
LoginPage
   |
   | POST /api/auth/login
   | { email, password }
   v
Authentication API
   |
   +--> invalid credentials -> error
   |
   +--> requires2FA -> OTP step
   |                     |
   |                     +--> POST /api/auth/verify-otp
   |                          { email, otp }
   |
   +-------------------------+
                             |
                         token + user
                             |
                             v
                    localStorage: ts_token
                             |
                             v
              Authorization: Bearer <token>
```

## Session restoration

On application startup, the client reads `ts_token` and requests `/api/users/me`. A successful response restores the authenticated user and profile. If the credential is rejected, the UI returns to the login page.

## Protected requests

Authenticated operations should include:

```http
Authorization: Bearer <access-token>
```

Examples include profile updates, assessment submission, document uploads, notification actions, and other protected user operations.

## Registration

Registration uses `POST /api/auth/register` with the user's name, email, password, and role. Client-side password-strength checks improve user feedback but do not replace server-side password validation and hashing.

## Token configuration

The backend environment template defines an HS256 JWT algorithm, a 30-minute access-token lifetime, and a 7-day refresh-token lifetime. Implementations should verify expiry and refresh behavior server-side.

## Security notes

- Never commit JWT signing secrets, SMTP passwords, API keys, passwords, or OTP values.
- Treat client-side role checks as navigation/UX only; authorization must be enforced by the backend.
- Avoid logging Authorization headers or authentication payloads.
- Review token storage against the application's XSS threat model.
