import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "expenses.db");

const db = new Database(dbPath);

try {
  if (!db) {
    throw new Error("Database connection failed");
  }

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL
  )
`
  ).run();
} catch (error) {
  console.error("Error with database:", error);
}

export { db };
