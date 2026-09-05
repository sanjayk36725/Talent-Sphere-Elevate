# Development Workflow

## Project conventions

Talent-Sphere-Elevate contains a React/TypeScript client and backend services. Keep UI components focused on presentation and interaction, and keep API/service concerns in reusable helpers.

## Authentication changes

When modifying authentication:

1. Trace the request from the page/component to the API endpoint.
2. Confirm that passwords and OTPs are never logged.
3. Confirm protected requests send the expected authorization mechanism.
4. Test expired, missing, malformed, and unauthorized credentials.
5. Verify role-sensitive operations on the server rather than relying only on client-side routing.

## API changes

Document new endpoints with their HTTP method, request shape, response shape, authentication requirement, and failure cases. Prefer stable error responses so the UI can handle failures consistently.

## Frontend changes

Run the project's build and relevant tests before opening a pull request. For browser-facing changes, verify loading, empty, success, and error states.

## Environment variables

Keep secrets in local environment files. The repository's `.gitignore` excludes `.env` files and local database files; do not bypass those protections by committing secrets under another filename.

## Review checklist

- [ ] No secrets or credentials were added.
- [ ] Error paths are handled.
- [ ] Authentication/authorization behavior was tested when relevant.
- [ ] Build/tests pass.
- [ ] Documentation was updated when behavior changed.