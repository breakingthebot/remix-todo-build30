import { useEffect, useRef } from "react";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import type { Todo } from "../models/todo.server";
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
      return json({ ok: false, error: "Todo title cannot be empty" }, { status: 400 });
    }
    await addTodo(title);
    return json({ ok: true, error: null });
  }

  if (intent === "toggle") {
    const id = String(formData.get("id") ?? "");
    await toggleTodo(id);
    return json({ ok: true, error: null });
  }

  if (intent === "delete") {
    const id = String(formData.get("id") ?? "");
    await deleteTodo(id);
    return json({ ok: true, error: null });
  }

  return json({ ok: false, error: "Unknown intent" }, { status: 400 });
}

export default function Index() {
  const { todos } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the input after a successful add. Uncontrolled inputs don't reset
  // themselves just because the loader revalidated with the new todo.
  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.error) {
      formRef.current?.reset();
    }
  }, [navigation.state, actionData]);

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", fontFamily: "sans-serif" }}>
      <h1>Remix Todo</h1>

      <p>
        <Link to="/todos">View / edit todos on their own pages &rarr;</Link>
      </p>

      <Form
        ref={formRef}
        method="post"
        style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
      >
        <input type="hidden" name="intent" value="create" />
        <input
          type="text"
          name="title"
          placeholder="What needs doing?"
          aria-label="Todo title"
          aria-invalid={actionData?.error ? true : undefined}
          aria-describedby="title-error"
          required
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" disabled={isSubmitting}>
          Add
        </button>
      </Form>

      <p id="title-error" role="alert" style={{ color: "#b3261e", margin: "0 0 1rem", minHeight: "1.2em" }}>
        {actionData?.error}
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>

      {todos.length === 0 && <p>No todos yet — add one above.</p>}
    </main>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const fetcher = useFetcher();

  // While a toggle/delete submission is in flight, derive the UI from what
  // was just submitted instead of waiting on the round trip — that's the
  // "optimistic" part. Once the fetcher settles, `todo` (from a revalidated
  // loader) becomes the source of truth again.
  const pendingIntent = fetcher.formData?.get("intent");
  const isDeleting = pendingIntent === "delete";
  const completed = pendingIntent === "toggle" ? !todo.completed : todo.completed;

  if (isDeleting) {
    return null;
  }

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid #ddd",
        opacity: fetcher.state !== "idle" ? 0.6 : 1,
      }}
    >
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="toggle" />
        <input type="hidden" name="id" value={todo.id} />
        <button
          type="submit"
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          style={{ cursor: "pointer" }}
        >
          {completed ? "✅" : "⬜"}
        </button>
      </fetcher.Form>

      <Link
        to={`/todos/${todo.id}`}
        style={{
          flex: 1,
          textDecoration: completed ? "line-through" : "none",
          color: completed ? "#888" : "inherit",
        }}
      >
        {todo.title}
      </Link>

      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="id" value={todo.id} />
        <button type="submit" aria-label="Delete todo">
          🗑️
        </button>
      </fetcher.Form>
    </li>
  );
}
