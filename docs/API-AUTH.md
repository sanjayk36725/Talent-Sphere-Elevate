# Authentication API Reference

## `POST /api/auth/register`

Creates an account.

Request fields:

- `name`
- `email`
- `password`
- `role`

The frontend performs a password-strength check before sending the request. The backend remains responsible for validation, hashing, and persistence.

## `POST /api/auth/login`

Authenticates an existing account.

Request fields:

- `email`
- `password`

A successful response supplies user information and an authentication token. If two-factor authentication is enabled for the account, the response can indicate `requires2FA` and the client proceeds to OTP verification.

## `POST /api/auth/verify-otp`

Completes the second authentication factor.

Request fields:

- `email`
- `otp`

A successful verification returns the authenticated user and token used by the frontend for subsequent protected requests.

## `GET /api/users/me`

Restores the authenticated session and retrieves the current user/profile.

Authentication:

```http
Authorization: Bearer <access-token>
```

## Protected API convention

Authenticated API calls should send the access token in the `Authorization` header and should receive an explicit unauthorized response when the credential is absent, invalid, or expired.

## Error handling

Client code should treat authentication failures as recoverable session errors: clear stale client authentication state when appropriate and require the user to authenticate again. Error responses should not expose password-verification details, signing secrets, tokens, stack traces, or OTP values.