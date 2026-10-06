import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..", "..");

// DB_PATH can point to another file, or ":memory:" for tests
const dbPath =
  process.env.DB_PATH || path.join(projectRoot, "data", "trackmyspend.db");

if (dbPath !== ":memory:") {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL COLLATE NOCASE,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);

  CREATE TABLE IF NOT EXISTS budgets (
    category TEXT PRIMARY KEY COLLATE NOCASE,
    monthly_limit REAL NOT NULL CHECK (monthly_limit > 0),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// One-time migration of data from the original expenses.db
const legacyPath = path.join(projectRoot, "expenses.db");
const isEmpty =
  (db.prepare("SELECT COUNT(*) AS n FROM transactions").get() as { n: number })
    .n === 0;

if (dbPath !== ":memory:" && isEmpty && fs.existsSync(legacyPath)) {
  db.exec(`ATTACH DATABASE '${legacyPath.replace(/'/g, "''")}' AS legacy`);
  const hasExpenses = db
    .prepare(
      "SELECT 1 FROM legacy.sqlite_master WHERE type = 'table' AND name = 'expenses'"
    )
    .get();
  if (hasExpenses) {
    const { changes } = db
      .prepare(
        `INSERT INTO transactions (amount, category, description, date)
         SELECT amount, category, description, date FROM legacy.expenses
         WHERE amount > 0 ORDER BY id`
      )
      .run();
    console.error(`Migrated ${changes} expense(s) from expenses.db`);
  }
  db.exec("DETACH DATABASE legacy");
}

export { db };
