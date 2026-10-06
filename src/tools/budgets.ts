import {
  getBudgetInput,
  getBudgetOutput,
  setBudgetInput,
  setBudgetOutput,
} from "../schemas/budget.js";
import { getBudgetStatus, setBudget } from "../services/budgetService.js";
import { defineTool, errorResult, money, result } from "./types.js";

export const setBudgetTool = defineTool({
  name: "set_budget",
  title: "Set budget",
  description:
    "Create or update the monthly budget for a category. Setting it again replaces the old amount.",
  inputSchema: setBudgetInput,
  outputSchema: setBudgetOutput,
  handler: async (args) => {
    try {
      const budget = setBudget(args);
      return result(
        `Budget for ${budget.category} set to ${money(budget.monthlyLimit)} per month.`,
        { budget }
      );
    } catch (error) {
      return errorResult(error);
    }
  },
});

export const getBudgetTool = defineTool({
  name: "get_budget",
  title: "Get budget status",
  description:
    "Show how much of each monthly budget has been spent in a month (default: current month).",
  inputSchema: getBudgetInput,
  outputSchema: getBudgetOutput,
  handler: async (args) => {
    try {
      const status = getBudgetStatus(args);
      if (status.budgets.length === 0) {
        return result("No budgets have been set yet.", status);
      }
      const lines = status.budgets.map(
        (b) =>
          `- ${b.category}: spent ${money(b.spent)} of ${money(b.monthlyLimit)} (${b.percentUsed}%)` +
          (b.overBudget
            ? `, over by ${money(-b.remaining)}`
            : `, ${money(b.remaining)} left`)
      );
      return result(`Budgets for ${status.month}:\n\n${lines.join("\n")}`, status);
    } catch (error) {
      return errorResult(error);
    }
  },
});
