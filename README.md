# Remix Todo

[![CI](https://github.com/breakingthebot/remix-todo-build30/actions/workflows/ci.yml/badge.svg)](https://github.com/breakingthebot/remix-todo-build30/actions/workflows/ci.yml)

## What this is (plain English)

A todo list web app you run yourself. You open it in a browser, type a task
and hit "Add," and it shows up in a list. You can check tasks off or delete
them right from the list — and that happens *instantly* in the browser, not
after waiting on a round trip to the server — or click a todo's title to open
it on its own page and rename it there. Every action still goes through the
server underneath (not just JavaScript in the browser), so the page works
even before any client-side JavaScript has loaded — that's what
"server-side rendering" means here.

Data lives in a real embedded SQLite database file on disk — no separate
database server to run or configure.

## Tech stack

- [Remix](https://remix.run) (v2, Vite-based) — full-stack web framework
- React 18, TypeScript
- Node.js runtime
- SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- Vitest for tests

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (Vite's dev server port — `npm start`,
the production build, serves on port 3000 instead).

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app locally with hot reloading |
| `npm run build` | Builds the production client + server bundles |
| `npm start` | Runs the production build (`npm run build` first) |
| `npm run typecheck` | Type-checks the project with TypeScript |
| `npm test` | Runs the Vitest test suite |

## Continuous integration

Every push and pull request against `main` runs typecheck, tests, and a
production build via GitHub Actions
(`.github/workflows/ci.yml`). See the badge above, or the
[Actions tab](https://github.com/breakingthebot/remix-todo-build30/actions)
on GitHub, for run history.

## How it works

- `app/models/todo.server.ts` — the data layer. Opens `data/todos.db` (a
  SQLite file, created automatically on first run with the `todos` table and
  seeded with two example todos). This file is gitignored since it's runtime
  data, not source code. Every exported function (`getTodos`, `addTodo`,
  `getTodo`, `updateTodoTitle`, `toggleTodo`, `deleteTodo`) keeps the exact
  same signature it had when this was a hand-rolled JSON file, so nothing
  above this layer — routes, tests — had to change when the storage swapped.
- `app/routes/_index.tsx` — the `/` route. Its `loader` reads the todo list
  for server-side rendering; its `action` handles add/toggle/delete submitted
  via Remix form actions. Each todo row is its own `TodoItem` component using
  `useFetcher` so toggling/deleting one item doesn't block the rest of the
  page — see "Optimistic UI" below. Each todo's title links to its detail
  page.
- `app/routes/todos.tsx` — layout route for `/todos/*`. Loads the full todo
  list for a sidebar nav and renders the matched child route via `<Outlet />`
  — this is Remix's nested routing: the layout and the child route each have
  their own `loader`.
- `app/routes/todos._index.tsx` — child route shown at exactly `/todos`
  (a placeholder prompt to pick a todo from the sidebar).
- `app/routes/todos.$id.tsx` — child route shown at `/todos/:id`. Its `loader`
  fetches one todo (404 via `ErrorBoundary` if the id doesn't exist); its
  `action` handles rename/toggle/delete for that single todo, redirecting
  back to `/todos` after a delete. The toggle button also uses `useFetcher`
  for the same instant feedback as the homepage list.
- `app/root.tsx` — the document shell (`<html>`, `<head>`, `<body>`) every
  route renders inside.
- `app/entry.client.tsx` / `app/entry.server.tsx` — Remix's standard hydration
  and server-rendering entry points.

## Optimistic UI

Toggling or deleting a todo updates the screen immediately, using the
`intent` field of the in-flight `fetcher.formData` to decide what the UI
should look like *before* the server responds:

- **Toggle** — the checkbox/strikethrough flips right away; the row dims
  slightly (`opacity: 0.6`) while the request is in flight, and settles back
  once the server confirms (or reverts if it fails).
- **Delete** — the row is removed from the list immediately rather than
  waiting for the server's response.

This is scoped to `useFetcher` (not the page-level `<Form>`/navigation) so
one todo's toggle/delete doesn't block interaction with the rest of the
list.

## Form validation

The server has always rejected an empty/whitespace-only title (HTML5's
`required` attribute stops a fully empty submit, but not a spaces-only one).
What was missing was telling the user *why* nothing happened. Both the "add
a todo" form and the detail page's rename form now read `useActionData()`
and show the server's error message inline (`role="alert"`, and the input
gets `aria-invalid`/`aria-describedby` wired to it) instead of silently
no-opping. On a successful add, the input also clears itself automatically
— it's an uncontrolled input, so nothing did that before.

## Testing manually

1. `npm run dev`
2. Visit http://localhost:5173
3. Add a todo, refresh the page — it should persist (confirms SSR + the
   SQLite data layer are both working, not just client state)
4. Toggle a todo complete/incomplete on the homepage — notice it updates
   instantly, with no page flash/reload
5. Delete a todo from the homepage list — it disappears immediately
6. Click a todo's title to open `/todos/:id` — rename it, toggle it, or
   delete it (delete redirects you back to `/todos`)
7. Visit a bogus id like `/todos/does-not-exist` — you should see a friendly
   "todo doesn't exist" message, not a crash
8. Type only spaces into the "add a todo" box and submit — you should see
   "Todo title cannot be empty" appear right under the form, and nothing
   gets added
9. Add a real todo after that — the error should clear and the input should
   empty itself
10. Try the same spaces-only submission on a todo's `/todos/:id` rename form
11. Inspect `data/todos.db` with any SQLite browser (or `sqlite3
    data/todos.db "SELECT * FROM todos;"`) — it should reflect all of the
    above changes

## Current scope / what's not here yet

This is iteration 7 of an incremental build. See `CHANGELOG.md` for what's
shipped so far.
