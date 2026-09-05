# Security Review Checklist

Use this checklist when reviewing changes that affect authentication, uploads, AI integrations, or exam integrity.

## Authentication

- [ ] Passwords are accepted only over HTTPS in deployed environments.
- [ ] Passwords are hashed server-side with a modern password-hashing algorithm.
- [ ] JWT signing secrets are supplied through environment configuration.
- [ ] Access-token expiry is enforced by the server.
- [ ] Refresh-token handling is validated and protected from replay where applicable.
- [ ] Authentication tokens are not written to logs.
- [ ] Logout behavior is documented, including any server-side revocation requirements.

## Two-factor authentication

- [ ] OTPs are generated with a cryptographically secure random source.
- [ ] OTPs have a short expiry.
- [ ] OTPs are single-use.
- [ ] Failed OTP attempts are rate-limited.
- [ ] OTP values are never logged or returned in API responses.

## Authorization

- [ ] Every protected API endpoint validates authentication server-side.
- [ ] Role checks are enforced server-side.
- [ ] Client-side route/page visibility is treated as UX only, not authorization.

## Client storage

- [ ] Sensitive values stored in browser storage have an explicit threat-model justification.
- [ ] XSS defenses are enabled and dependencies are kept current.
- [ ] Tokens are cleared when a session is terminated.

## Secrets and data

- [ ] `.env` files remain untracked.
- [ ] API keys and SMTP credentials are not committed.
- [ ] Uploaded documents are validated and access-controlled.
- [ ] Error responses do not expose secrets, tokens, stack traces, or private data.