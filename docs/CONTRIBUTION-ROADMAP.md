# Contribution Roadmap

This roadmap turns common maintenance work into small, reviewable contributions.

## Authentication

- Add automated tests for login success and failure.
- Add tests for expired and malformed Bearer tokens.
- Add tests for OTP expiry, single-use behavior, and rate limiting.
- Verify server-side role authorization for every protected endpoint.
- Document access-token refresh behavior.

## Frontend quality

- Extract repeated authenticated-fetch logic into one typed helper.
- Add loading and error states to API-backed pages.
- Add reusable form validation utilities.
- Improve accessibility labels and keyboard navigation.
- Remove development-only demo credentials from production UI.

## Backend quality

- Add structured request/error logging without sensitive authentication data.
- Add API tests for unauthorized and forbidden responses.
- Add input validation for uploaded files.
- Add health and readiness checks for deployment.

## Developer experience

- Add CI for type checking, linting, and tests.
- Add a pull-request checklist.
- Keep API documentation synchronized with endpoint behavior.
- Add architecture diagrams for major flows.
