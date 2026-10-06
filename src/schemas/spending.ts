import { z } from "zod";
import { categorySchema, dateSchema, monthSchema } from "./common.js";

// A period is either a month or an explicit date range
export const periodInput = {
  month: monthSchema
    .optional()
    .describe("Month in YYYY-MM format. Defaults to the current month."),
  startDate: dateSchema
    .optional()
    .describe("Start of a custom range, YYYY-MM-DD. Use instead of month."),
  endDate: dateSchema
    .optional()
    .describe("End of a custom range, YYYY-MM-DD. Use instead of month."),
};

export const periodOutput = z.object({
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  label: z.string(),
});

export const spendingSummaryInput = z.object({
  ...periodInput,
  category: categorySchema.optional().describe("Only this category"),
});

export const spendingSummaryOutput = z.object({
  period: periodOutput,
  category: z.string().nullable(),
  total: z.number(),
  count: z.number(),
});

export const categorySummaryInput = z.object(periodInput);

export const categorySummaryOutput = z.object({
  period: periodOutput,
  total: z.number(),
  categories: z.array(
    z.object({
      category: z.string(),
      total: z.number(),
      count: z.number(),
      percent: z.number(),
    })
  ),
});
