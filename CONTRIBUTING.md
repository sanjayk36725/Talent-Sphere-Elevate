# Contributing to Talent-Sphere-Elevate

Thank you for contributing to Talent-Sphere-Elevate.

## Development setup

1. Install Node.js 18 or newer.
2. Install dependencies with `npm install`.
3. Copy the appropriate environment template and configure local secrets.
4. Start the development server with `npm run dev`.

## Branching

Create a focused branch from `main`:

```bash
git checkout -b feature/short-description
```

Use `fix/`, `docs/`, `refactor/`, `test/`, or `chore/` for other change types.

## Pull requests

Keep pull requests small and focused. Include:

- What changed and why.
- How the change was tested.
- Screenshots for meaningful UI changes.
- Any environment-variable or migration requirements.
- Security considerations for authentication, uploads, proctoring, or external APIs.

## Code quality

Prefer strict TypeScript, small reusable components, explicit error handling, and accessible UI behavior. Avoid committing secrets, local databases, uploads, generated build output, or personal credentials.

## Commit messages

Use clear imperative messages, for example:

```text
fix: handle expired authentication tokens
feat: add assessment retry state
```

## Security-sensitive changes

Do not include tokens, passwords, API keys, OTPs, or personal data in commits, issues, screenshots, or logs. Follow `SECURITY.md` for vulnerability reports.