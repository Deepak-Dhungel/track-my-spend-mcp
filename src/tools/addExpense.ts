import { z } from "zod";

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
    const expenseDate = date || new Date().toISOString().split("T")[0];

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully added expense: $${amount} for ${category} on ${expenseDate}`,
        },
      ],
    };
  },
};
