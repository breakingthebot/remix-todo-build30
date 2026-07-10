import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import { addTodo, deleteTodo, getTodos, toggleTodo } from "../models/todo.server";

export async function loader(_args: LoaderFunctionArgs) {
  const todos = await getTodos();
  return json({ todos });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = String(formData.get("title") ?? "");
    if (!title.trim()) {
      return json({ error: "Todo title cannot be empty" }, { status: 400 });
    }
    await addTodo(title);
    return json({ ok: true });
  }

  if (intent === "toggle") {
    const id = String(formData.get("id") ?? "");
    await toggleTodo(id);
    return json({ ok: true });
  }

  if (intent === "delete") {
    const id = String(formData.get("id") ?? "");
    await deleteTodo(id);
    return json({ ok: true });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
}

export default function Index() {
  const { todos } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", fontFamily: "sans-serif" }}>
      <h1>Remix Todo</h1>

      <Form method="post" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input type="hidden" name="intent" value="create" />
        <input
          type="text"
          name="title"
          placeholder="What needs doing?"
          aria-label="Todo title"
          required
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" disabled={isSubmitting}>
          Add
        </button>
      </Form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Form method="post">
              <input type="hidden" name="intent" value="toggle" />
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                style={{ cursor: "pointer" }}
              >
                {todo.completed ? "✅" : "⬜"}
              </button>
            </Form>

            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#888" : "inherit",
              }}
            >
              {todo.title}
            </span>

            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit" aria-label="Delete todo">
                🗑️
              </button>
            </Form>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>No todos yet — add one above.</p>}
    </main>
  );
}
