import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { deleteTodo, getTodo, toggleTodo, updateTodoTitle } from "../models/todo.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const todo = await getTodo(params.id ?? "");
  if (!todo) {
    throw new Response("Todo not found", { status: 404 });
  }
  return json({ todo });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id ?? "";
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update") {
    const title = String(formData.get("title") ?? "");
    if (!title.trim()) {
      return json({ ok: false, error: "Todo title cannot be empty" }, { status: 400 });
    }
    await updateTodoTitle(id, title);
    return json({ ok: true, error: null });
  }

  if (intent === "toggle") {
    await toggleTodo(id);
    return json({ ok: true, error: null });
  }

  if (intent === "delete") {
    await deleteTodo(id);
    return redirect("/todos");
  }

  return json({ ok: false, error: "Unknown intent" }, { status: 400 });
}

export default function TodoDetail() {
  const { todo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const toggleFetcher = useFetcher();

  const completed =
    toggleFetcher.formData?.get("intent") === "toggle" ? !todo.completed : todo.completed;

  return (
    <div>
      <h2>Edit todo</h2>

      <Form method="post" style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <input type="hidden" name="intent" value="update" />
        <input
          type="text"
          name="title"
          defaultValue={todo.title}
          aria-invalid={actionData?.error ? true : undefined}
          aria-describedby="title-error"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit">Save</button>
      </Form>

      <p id="title-error" role="alert" style={{ color: "#b3261e", margin: "0 0 1rem", minHeight: "1.2em" }}>
        {actionData?.error}
      </p>

      <toggleFetcher.Form method="post" style={{ marginBottom: "0.5rem" }}>
        <input type="hidden" name="intent" value="toggle" />
        <button type="submit">{completed ? "Mark incomplete" : "Mark complete"}</button>
      </toggleFetcher.Form>

      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button type="submit">Delete</button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <p>That todo doesn&apos;t exist (maybe it was deleted).</p>;
  }

  return <p>Something went wrong loading this todo.</p>;
}
