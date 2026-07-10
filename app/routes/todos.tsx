import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { getTodos } from "../models/todo.server";

export async function loader(_args: LoaderFunctionArgs) {
  const todos = await getTodos();
  return json({ todos });
}

export default function TodosLayout() {
  const { todos } = useLoaderData<typeof loader>();

  return (
    <main style={{ maxWidth: 640, margin: "3rem auto", fontFamily: "sans-serif" }}>
      <p>
        <Link to="/">&larr; Back to list</Link>
      </p>
      <h1>Todos</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <nav style={{ minWidth: 200 }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {todos.map((todo) => (
              <li key={todo.id} style={{ padding: "0.25rem 0" }}>
                <NavLink
                  to={`/todos/${todo.id}`}
                  style={({ isActive }) => ({
                    textDecoration: todo.completed ? "line-through" : "none",
                    fontWeight: isActive ? "bold" : "normal",
                  })}
                >
                  {todo.title}
                </NavLink>
              </li>
            ))}
          </ul>
          {todos.length === 0 && <p>No todos yet.</p>}
        </nav>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </main>
  );
}
