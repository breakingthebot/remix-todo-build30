# Changelog

All notable changes to this project are documented here.

## [0.1.0] - 2026-07-10

### Added
- Initial Remix (Vite) app scaffold: TypeScript, entry client/server, root
  layout.
- Todo data layer (`app/models/todo.server.ts`) backed by a gitignored JSON
  file, seeded automatically on first run.
- `/` route (`app/routes/_index.tsx`) with server-side rendered todo list and
  add/toggle/delete via Remix form actions.
- Vitest test suite covering the todo data layer (seed, add, reject-empty,
  toggle, delete).
- MIT License.
- Project scaffolding docs: README, this changelog, `.env.example`,
  `.gitignore`.
