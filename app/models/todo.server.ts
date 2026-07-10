import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

const SEED_TODOS: Todo[] = [
  {
    id: randomUUID(),
    title: "Write the README",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    title: "Wire up the todo form action",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

async function readTodos(): Promise<Todo[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Todo[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeTodos(SEED_TODOS);
      return SEED_TODOS;
    }
    throw error;
  }
}

async function writeTodos(todos: Todo[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");
}

export async function getTodos(): Promise<Todo[]> {
  const todos = await readTodos();
  return [...todos].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addTodo(title: string): Promise<Todo> {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Todo title cannot be empty");
  }

  const todos = await readTodos();
  const todo: Todo = {
    id: randomUUID(),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  await writeTodos([...todos, todo]);
  return todo;
}

export async function toggleTodo(id: string): Promise<void> {
  const todos = await readTodos();
  const next = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
  await writeTodos(next);
}

export async function deleteTodo(id: string): Promise<void> {
  const todos = await readTodos();
  await writeTodos(todos.filter((todo) => todo.id !== id));
}
