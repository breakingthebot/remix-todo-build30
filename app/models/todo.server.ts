import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "todos.db");

type TodoRow = {
  id: string;
  title: string;
  completed: number;
  createdAt: string;
};

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.createdAt,
  };
}

function seedTodos(): Todo[] {
  return [
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
}

function ensureSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    )
  `);

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM todos").get() as {
    count: number;
  };

  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO todos (id, title, completed, createdAt) VALUES (@id, @title, @completed, @createdAt)",
    );
    for (const todo of seedTodos()) {
      insert.run({ ...todo, completed: todo.completed ? 1 : 0 });
    }
  }
}

// better-sqlite3 is synchronous, so each call opens, uses, and closes its
// own connection rather than holding one open for the process lifetime.
// For this app's traffic that cost is negligible, and it sidesteps file
// locks that would otherwise complicate cwd-scoped tests (each test points
// at its own temp directory).
function withDb<T>(fn: (db: Database.Database) => T): T {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DATA_FILE);
  try {
    ensureSchema(db);
    return fn(db);
  } finally {
    db.close();
  }
}

export async function getTodos(): Promise<Todo[]> {
  return withDb((db) => {
    const rows = db.prepare("SELECT * FROM todos ORDER BY createdAt ASC").all() as TodoRow[];
    return rows.map(rowToTodo);
  });
}

export async function addTodo(title: string): Promise<Todo> {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Todo title cannot be empty");
  }

  return withDb((db) => {
    const todo: Todo = {
      id: randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    db.prepare(
      "INSERT INTO todos (id, title, completed, createdAt) VALUES (@id, @title, @completed, @createdAt)",
    ).run({ ...todo, completed: 0 });
    return todo;
  });
}

export async function getTodo(id: string): Promise<Todo | null> {
  return withDb((db) => {
    const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow | undefined;
    return row ? rowToTodo(row) : null;
  });
}

export async function updateTodoTitle(id: string, title: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Todo title cannot be empty");
  }

  withDb((db) => {
    db.prepare("UPDATE todos SET title = ? WHERE id = ?").run(trimmed, id);
  });
}

export async function toggleTodo(id: string): Promise<void> {
  withDb((db) => {
    db.prepare("UPDATE todos SET completed = 1 - completed WHERE id = ?").run(id);
  });
}

export async function deleteTodo(id: string): Promise<void> {
  withDb((db) => {
    db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  });
}
