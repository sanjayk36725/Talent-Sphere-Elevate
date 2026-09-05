# Security Policy

## Supported versions

Security fixes target the current `main` branch unless a release-specific policy is introduced.

## Reporting a vulnerability

Please do not disclose exploitable vulnerabilities in a public issue. Report them privately to the repository maintainers through GitHub's private vulnerability reporting mechanism when enabled for the repository.

Include:

- A clear description of the vulnerability.
- Affected component or endpoint.
- Reproduction steps or a minimal proof of concept.
- Potential impact.
- Suggested mitigation, when known.

## Credential handling

Never commit real passwords, JWT signing secrets, API keys, SMTP credentials, OTP values, private keys, or production database credentials. Use environment variables and local development values instead.

## Authentication and authorization

Changes involving JWTs, login, two-factor authentication, role checks, session persistence, password handling, or protected API routes should include tests for both successful and unauthorized paths.

## Data handling

Avoid logging authentication headers, passwords, OTPs, uploaded private documents, or other sensitive user data. Sanitize error messages before exposing them to clients.