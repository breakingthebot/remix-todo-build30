# Changelog

All notable changes to this project are documented here.

## [0.3.0] - 2026-07-10

### Added
- GitHub Actions CI workflow (`.github/workflows/ci.yml`): runs on every
  push/PR to `main`, installs with `npm ci`, then runs typecheck, tests, and
  a production build (Node 22).
- CI status badge and a "Continuous integration" section in the README.

## [0.2.0] - 2026-07-10

### Added
- Nested routes for viewing/editing a single todo: `app/routes/todos.tsx`
  (layout + sidebar nav), `app/routes/todos._index.tsx` (empty-state child),
  `app/routes/todos.$id.tsx` (detail/edit child with its own loader/action).
- `getTodo` and `updateTodoTitle` in the data layer, with test coverage.
- 404 handling for an unknown todo id via a route `ErrorBoundary`.
- Homepage todo titles now link to their detail/edit page.
- GitHub repo description and topics.

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
