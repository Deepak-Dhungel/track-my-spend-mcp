import { z } from "zod";
import { db } from "../db.js";

export const addExpenseTool = {
  name: "add_expense",
  description: "Add a new expense to track spending",
  inputSchema: z.object({
    amount: z.number().min(0),
    category: z.string().min(1),
    description: z.string().optional(),
    date: z.string().optional(),
  }),
  handler: async ({ amount, category, description, date }: any) => {
    // If no date is provided, use the current date
    const expenseDate = date || new Date().toISOString().split("T")[0];

    // Insert the expense into the database
    const result = db
      .prepare(
        `INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)`
      )
      .run(amount, category, description || null, expenseDate);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully added expense #${result.lastInsertRowid}: $${amount} for ${category} on ${expenseDate}`,
        },
      ],
    };
  },
};
