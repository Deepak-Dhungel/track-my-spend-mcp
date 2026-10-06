import { z } from "zod";
import { amountSchema, categorySchema, monthSchema } from "./common.js";

export const budgetStatusSchema = z.object({
  category: z.string(),
  monthlyLimit: z.number(),
  spent: z.number(),
  remaining: z.number(),
  percentUsed: z.number(),
  overBudget: z.boolean(),
});

export const setBudgetInput = z.object({
  category: categorySchema.describe("Spending category, e.g. Food"),
  monthlyLimit: amountSchema.describe("Monthly budget amount, e.g. 500"),
});

export const setBudgetOutput = z.object({
  budget: z.object({ category: z.string(), monthlyLimit: z.number() }),
});

export const getBudgetInput = z.object({
  category: categorySchema
    .optional()
    .describe("Only this category. Omit to get every budget."),
  month: monthSchema
    .optional()
    .describe("Month in YYYY-MM format. Defaults to the current month."),
});

export const getBudgetOutput = z.object({
  month: z.string(),
  budgets: z.array(budgetStatusSchema),
});
