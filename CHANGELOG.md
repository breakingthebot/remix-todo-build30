# Changelog

All notable changes to this project are documented here.

## [0.6.0] - 2026-07-11

### Investigated
- The React hydration console warning noted in 0.4.0 ("Known issues" below)
  does not reproduce. Tested: cold dev-server load, warm dev-server load,
  post-interaction (toggle/delete clicks), and the full production build —
  all clean, no console errors, across multiple repeated runs. Most likely
  explanation: a one-time Vite dev-server cold-compile race on the very
  first request to a freshly started server, not a real SSR/client markup
  mismatch in the app. No code changed, since there's nothing reproducible
  to fix — the 0.4.0 changelog entry below is corrected accordingly.

## [0.5.0] - 2026-07-10

### Changed
- Data layer (`app/models/todo.server.ts`) now persists to a real SQLite
  database (`data/todos.db`, via `better-sqlite3`) instead of a hand-rolled
  JSON file. Every exported function kept its exact prior signature, so no
  route or test code needed to change.
- `.gitignore` now excludes the whole `data/` directory (was previously
  scoped to just `data/todos.json`).

### Added
- `better-sqlite3` (dependency) + `@types/better-sqlite3` (dev dependency).

## [0.4.0] - 2026-07-10

### Added
- Optimistic UI for toggle/delete on the homepage list (`app/routes/_index.tsx`):
  each todo row is now a `TodoItem` component using `useFetcher`, so the
  checkbox flips and deleted rows disappear immediately instead of waiting
  on the server round trip.
- Same optimistic toggle behavior on the `/todos/:id` detail page
  (`app/routes/todos.$id.tsx`).
- Verified interactively with a headless-browser (Playwright) smoke test:
  home page render, instant toggle, instant delete, nested route navigation,
  console-error check.

### Fixed
- README's "Getting started" pointed at the wrong port for `npm run dev`
  (Vite serves on 5173, not 3000 — that's the production `npm start` port).

### Known issues
- ~~Harmless React hydration warning on the todo-title `<input>`'s `style`
  attribute~~ — see 0.6.0 above: this did not reproduce on investigation and
  was most likely a one-time dev-server artifact, not a real issue.

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
