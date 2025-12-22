import { z } from "zod";
import { db } from "../db.js";

export const listExpenseTool = {
  name: "list_expense",
  description: "Lists expenses with filtering by date range, category",
  inputSchema: z.object({
    category: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }),

  handler: async ({ category, startDate, endDate }: any) => {
    // Construct the SQL query dynamically based on the provided parameters
    let query = `SELECT * FROM expenses WHERE 1=1`;
    const params = [];

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    // Execute the query with all the provided parameters
    const result = db.prepare(query).all(...params);

    if (result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No expenses found matching your criteria.",
          },
        ],
      };
    }

    // Calculate the total amount of expenses
    const total = result.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Format the expense list
    const expenseList = result
      .map(
        (exp: any) =>
          `- $${exp.amount} for ${exp.category} on ${exp.date}${
            exp.description ? ` (${exp.description})` : ""
          }`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${result.length} expense(s) - Total: $${total.toFixed(
            2
          )}\n\n${expenseList}`,
        },
      ],
    };
  },
};
