import {
  categorySummaryInput,
  categorySummaryOutput,
  spendingSummaryInput,
  spendingSummaryOutput,
} from "../schemas/spending.js";
import { getCategorySummary, getSpendingSummary } from "../services/spendingService.js";
import { defineTool, errorResult, money, result } from "./types.js";

export const getSpendingSummaryTool = defineTool({
  name: "get_spending_summary",
  title: "Get spending summary",
  description:
    "Total amount spent in a month (default: current month) or date range, optionally for one category.",
  inputSchema: spendingSummaryInput,
  outputSchema: spendingSummaryOutput,
  handler: async (args) => {
    try {
      const summary = getSpendingSummary(args);
      const scope = summary.category ? ` on ${summary.category}` : "";
      return result(
        `Spent ${money(summary.total)}${scope} across ${summary.count} transaction(s) for ${summary.period.label}.`,
        summary
      );
    } catch (error) {
      return errorResult(error);
    }
  },
});

export const getCategorySummaryTool = defineTool({
  name: "get_category_summary",
  title: "Get category summary",
  description:
    "Spending per category for a month (default: current month) or date range, largest first.",
  inputSchema: categorySummaryInput,
  outputSchema: categorySummaryOutput,
  handler: async (args) => {
    try {
      const summary = getCategorySummary(args);
      if (summary.categories.length === 0) {
        return result(`No spending recorded for ${summary.period.label}.`, summary);
      }
      const lines = summary.categories.map(
        (c) => `- ${c.category}: ${money(c.total)} (${c.percent}%, ${c.count} transaction(s))`
      );
      return result(
        `Spending by category for ${summary.period.label}, total ${money(summary.total)}:\n\n${lines.join("\n")}`,
        summary
      );
    } catch (error) {
      return errorResult(error);
    }
  },
});
