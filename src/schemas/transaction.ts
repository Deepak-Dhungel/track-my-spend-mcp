import { z } from "zod";
import { amountSchema, categorySchema, dateSchema } from "./common.js";

export const transactionSchema = z.object({
  id: z.number(),
  amount: z.number(),
  category: z.string(),
  description: z.string().nullable(),
  date: z.string(),
});

export const addTransactionInput = z.object({
  amount: amountSchema.describe("Amount spent, e.g. 18.42"),
  category: categorySchema.describe("Spending category, e.g. Food"),
  description: z
    .string()
    .trim()
    .max(200)
    .optional()
    .describe("Merchant or note, e.g. Chipotle"),
  date: dateSchema
    .optional()
    .describe("Date in YYYY-MM-DD format. Defaults to today."),
});

export const addTransactionOutput = z.object({
  transaction: transactionSchema,
});

export const getTransactionsInput = z.object({
  category: categorySchema.optional().describe("Only this category"),
  startDate: dateSchema.optional().describe("Earliest date, YYYY-MM-DD"),
  endDate: dateSchema.optional().describe("Latest date, YYYY-MM-DD"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Maximum number of transactions to return, newest first"),
});

export const searchTransactionsInput = getTransactionsInput.extend({
  query: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .describe("Text to find in the description or category, e.g. Amazon"),
});

export const transactionListOutput = z.object({
  count: z.number(),
  total: z.number(),
  transactions: z.array(transactionSchema),
});
