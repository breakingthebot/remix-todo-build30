# Remix Todo

## What this is (plain English)

A todo list web app you run yourself. You open it in a browser, type a task
and hit "Add," and it shows up in a list. You can check tasks off or delete
them right from the list, or click a todo's title to open it on its own page
and rename it there. Every action goes through the server (not just
JavaScript in the browser), so the page still works even before any
client-side JavaScript has loaded — that's what "server-side rendering" means
here.

Right now the app stores its data in a plain JSON file on disk. That's
intentionally simple for this first iteration; it's not meant to survive a
real production deployment, just to make the app fully functional and
testable today.

## Tech stack

- [Remix](https://remix.run) (v2, Vite-based) — full-stack web framework
- React 18, TypeScript
- Node.js runtime
- Vitest for tests

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app locally with hot reloading |
| `npm run build` | Builds the production client + server bundles |
| `npm start` | Runs the production build (`npm run build` first) |
| `npm run typecheck` | Type-checks the project with TypeScript |
| `npm test` | Runs the Vitest test suite |

## How it works

- `app/models/todo.server.ts` — the data layer. Reads and writes todos to
  `data/todos.json` (created automatically on first run, seeded with two
  example todos). This file is gitignored since it's runtime data, not
  source code.
- `app/routes/_index.tsx` — the `/` route. Its `loader` reads the todo list
  for server-side rendering; its `action` handles add/toggle/delete submitted
  via plain HTML `<Form>` elements (Remix form actions). Each todo's title
  links to its detail page.
- `app/routes/todos.tsx` — layout route for `/todos/*`. Loads the full todo
  list for a sidebar nav and renders the matched child route via `<Outlet />`
  — this is Remix's nested routing: the layout and the child route each have
  their own `loader`.
- `app/routes/todos._index.tsx` — child route shown at exactly `/todos`
  (a placeholder prompt to pick a todo from the sidebar).
- `app/routes/todos.$id.tsx` — child route shown at `/todos/:id`. Its `loader`
  fetches one todo (404 via `ErrorBoundary` if the id doesn't exist); its
  `action` handles rename/toggle/delete for that single todo, redirecting
  back to `/todos` after a delete.
- `app/root.tsx` — the document shell (`<html>`, `<head>`, `<body>`) every
  route renders inside.
- `app/entry.client.tsx` / `app/entry.server.tsx` — Remix's standard hydration
  and server-rendering entry points.

## Testing manually

1. `npm run dev`
2. Visit http://localhost:3000
3. Add a todo, refresh the page — it should persist (confirms SSR + the JSON
   data layer are both working, not just client state)
4. Toggle a todo complete/incomplete
5. Click a todo's title to open `/todos/:id` — rename it, toggle it, or
   delete it (delete redirects you back to `/todos`)
6. Visit a bogus id like `/todos/does-not-exist` — you should see a friendly
   "todo doesn't exist" message, not a crash
7. Delete a todo from the homepage list too
8. Check `data/todos.json` in the project folder — it should reflect all of
   the above changes

## Current scope / what's not here yet

This is iteration 2 of an incremental build. Not yet implemented: optimistic
UI updates and a real database. See `CHANGELOG.md` for what's shipped so
far.
