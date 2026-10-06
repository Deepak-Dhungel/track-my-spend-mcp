import {
  addTransactionInput,
  addTransactionOutput,
  getTransactionsInput,
  searchTransactionsInput,
  transactionListOutput,
} from "../schemas/transaction.js";
import { addTransaction, listTransactions } from "../services/transactionService.js";
import type { TransactionRow } from "../db/queries.js";
import { defineTool, errorResult, money, result } from "./types.js";

function formatList(
  heading: string,
  list: { count: number; total: number; transactions: TransactionRow[] }
) {
  if (list.count === 0) return "No transactions found matching your criteria.";
  const lines = list.transactions.map(
    (t) =>
      `- #${t.id} ${t.date}: ${money(t.amount)} for ${t.category}${
        t.description ? ` (${t.description})` : ""
      }`
  );
  return `${heading} ${list.count} transaction(s), total ${money(list.total)}\n\n${lines.join("\n")}`;
}

export const addTransactionTool = defineTool({
  name: "add_transaction",
  title: "Add transaction",
  description: "Record a new spending transaction.",
  inputSchema: addTransactionInput,
  outputSchema: addTransactionOutput,
  handler: async (args) => {
    try {
      const transaction = addTransaction(args);
      return result(
        `Added transaction #${transaction.id}: ${money(transaction.amount)} for ${
          transaction.category
        } on ${transaction.date}`,
        { transaction }
      );
    } catch (error) {
      return errorResult(error);
    }
  },
});

export const getTransactionsTool = defineTool({
  name: "get_transactions",
  title: "Get transactions",
  description:
    "List transactions, newest first, optionally filtered by category and date range.",
  inputSchema: getTransactionsInput,
  outputSchema: transactionListOutput,
  handler: async (args) => {
    try {
      const list = listTransactions(args);
      return result(formatList("Found", list), list);
    } catch (error) {
      return errorResult(error);
    }
  },
});

export const searchTransactionsTool = defineTool({
  name: "search_transactions",
  title: "Search transactions",
  description:
    "Find transactions whose description or category contains the given text (case-insensitive).",
  inputSchema: searchTransactionsInput,
  outputSchema: transactionListOutput,
  handler: async (args) => {
    try {
      const list = listTransactions(args);
      return result(formatList(`Matching "${args.query}":`, list), list);
    } catch (error) {
      return errorResult(error);
    }
  },
});
