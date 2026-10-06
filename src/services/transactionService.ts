import {
  findTransactions,
  insertTransaction,
  type TransactionFilters,
} from "../db/queries.js";
import { roundMoney, today } from "./dates.js";

export function addTransaction(input: {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}) {
  return insertTransaction({
    amount: roundMoney(input.amount),
    category: input.category,
    description: input.description || null,
    date: input.date ?? today(),
  });
}

export function listTransactions(filters: TransactionFilters) {
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    throw new Error("startDate must be on or before endDate.");
  }
  const transactions = findTransactions(filters);
  const total = roundMoney(transactions.reduce((sum, t) => sum + t.amount, 0));
  return { count: transactions.length, total, transactions };
}
