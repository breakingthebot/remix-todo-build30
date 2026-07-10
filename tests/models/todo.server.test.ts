import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cwdSpy: ReturnType<typeof vi.spyOn>;
let tempDir: string;

describe("todo.server", () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "remix-todo-test-"));
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tempDir);
    vi.resetModules();
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it("seeds and returns todos sorted by creation order", async () => {
    const { getTodos } = await import("../../app/models/todo.server");
    const todos = await getTodos();
    expect(todos.length).toBeGreaterThan(0);
    const sorted = [...todos].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    expect(todos).toEqual(sorted);
  });

  it("adds a todo", async () => {
    const { addTodo, getTodos } = await import("../../app/models/todo.server");
    await addTodo("Buy milk");
    const todos = await getTodos();
    expect(todos.some((t) => t.title === "Buy milk" && !t.completed)).toBe(true);
  });

  it("rejects an empty title", async () => {
    const { addTodo } = await import("../../app/models/todo.server");
    await expect(addTodo("   ")).rejects.toThrow("Todo title cannot be empty");
  });

  it("toggles a todo's completed state", async () => {
    const { addTodo, toggleTodo, getTodos } = await import("../../app/models/todo.server");
    const created = await addTodo("Walk the dog");
    await toggleTodo(created.id);
    const todos = await getTodos();
    expect(todos.find((t) => t.id === created.id)?.completed).toBe(true);
  });

  it("deletes a todo", async () => {
    const { addTodo, deleteTodo, getTodos } = await import("../../app/models/todo.server");
    const created = await addTodo("Temporary task");
    await deleteTodo(created.id);
    const todos = await getTodos();
    expect(todos.find((t) => t.id === created.id)).toBeUndefined();
  });

  it("gets a single todo by id, or null if missing", async () => {
    const { addTodo, getTodo } = await import("../../app/models/todo.server");
    const created = await addTodo("Find me");
    await expect(getTodo(created.id)).resolves.toEqual(created);
    await expect(getTodo("does-not-exist")).resolves.toBeNull();
  });

  it("updates a todo's title", async () => {
    const { addTodo, updateTodoTitle, getTodo } = await import("../../app/models/todo.server");
    const created = await addTodo("Origin title");
    await updateTodoTitle(created.id, "Updated title");
    const updated = await getTodo(created.id);
    expect(updated?.title).toBe("Updated title");
  });

  it("rejects an empty title on update", async () => {
    const { addTodo, updateTodoTitle } = await import("../../app/models/todo.server");
    const created = await addTodo("Origin title");
    await expect(updateTodoTitle(created.id, "   ")).rejects.toThrow(
      "Todo title cannot be empty",
    );
  });
});
