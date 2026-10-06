import { db } from "./connection.js";

export interface TransactionRow {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export interface TransactionFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  query?: string;
  limit?: number;
}

export interface BudgetRow {
  category: string;
  monthly_limit: number;
}

const TRANSACTION_COLUMNS = "id, amount, category, description, date";

export function insertTransaction(t: Omit<TransactionRow, "id">) {
  const result = db
    .prepare(
      `INSERT INTO transactions (amount, category, description, date) VALUES (?, ?, ?, ?)`
    )
    .run(t.amount, t.category, t.description, t.date);
  return getTransactionById(Number(result.lastInsertRowid))!;
}

export function getTransactionById(id: number) {
  return db
    .prepare(`SELECT ${TRANSACTION_COLUMNS} FROM transactions WHERE id = ?`)
    .get(id) as TransactionRow | undefined;
}

// Build a WHERE clause shared by listing and summary queries
function whereClause(filters: TransactionFilters) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category);
  }
  if (filters.startDate) {
    conditions.push("date >= ?");
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push("date <= ?");
    params.push(filters.endDate);
  }
  if (filters.query) {
    conditions.push("(description LIKE ? ESCAPE '\\' OR category LIKE ? ESCAPE '\\')");
    const pattern = `%${filters.query.replace(/[\\%_]/g, "\\$&")}%`;
    params.push(pattern, pattern);
  }

  return {
    sql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export function findTransactions(filters: TransactionFilters) {
  const { sql, params } = whereClause(filters);
  const limit = filters.limit ? ` LIMIT ${Math.floor(filters.limit)}` : "";
  return db
    .prepare(
      `SELECT ${TRANSACTION_COLUMNS} FROM transactions ${sql} ORDER BY date DESC, id DESC${limit}`
    )
    .all(...params) as TransactionRow[];
}

export function sumTransactions(filters: TransactionFilters) {
  const { sql, params } = whereClause(filters);
  return db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM transactions ${sql}`
    )
    .get(...params) as { total: number; count: number };
}

export function sumByCategory(filters: TransactionFilters) {
  const { sql, params } = whereClause(filters);
  return db
    .prepare(
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count
       FROM transactions ${sql}
       GROUP BY category COLLATE NOCASE
       ORDER BY total DESC`
    )
    .all(...params) as { category: string; total: number; count: number }[];
}

export function upsertBudget(category: string, monthlyLimit: number) {
  db.prepare(
    `INSERT INTO budgets (category, monthly_limit) VALUES (?, ?)
     ON CONFLICT (category) DO UPDATE SET
       monthly_limit = excluded.monthly_limit,
       updated_at = datetime('now')`
  ).run(category, monthlyLimit);
  return getBudget(category)!;
}

export function getBudget(category: string) {
  return db
    .prepare(`SELECT category, monthly_limit FROM budgets WHERE category = ?`)
    .get(category) as BudgetRow | undefined;
}

export function listBudgets() {
  return db
    .prepare(`SELECT category, monthly_limit FROM budgets ORDER BY category`)
    .all() as BudgetRow[];
}
