import {
  getBudget as findBudget,
  listBudgets,
  sumTransactions,
  upsertBudget,
} from "../db/queries.js";
import { currentMonth, monthRange, roundMoney } from "./dates.js";

export function setBudget(input: { category: string; monthlyLimit: number }) {
  const row = upsertBudget(input.category, roundMoney(input.monthlyLimit));
  return { category: row.category, monthlyLimit: row.monthly_limit };
}

// Compare each budget with what was spent in that category during the month
export function getBudgetStatus(input: { category?: string; month?: string }) {
  const month = input.month ?? currentMonth();
  const { startDate, endDate } = monthRange(month);

  let budgets;
  if (input.category) {
    const budget = findBudget(input.category);
    if (!budget) {
      throw new Error(`No budget set for category "${input.category}".`);
    }
    budgets = [budget];
  } else {
    budgets = listBudgets();
  }

  return {
    month,
    budgets: budgets.map((b) => {
      const spent = roundMoney(
        sumTransactions({ category: b.category, startDate, endDate }).total
      );
      return {
        category: b.category,
        monthlyLimit: b.monthly_limit,
        spent,
        remaining: roundMoney(b.monthly_limit - spent),
        percentUsed: Math.round((spent / b.monthly_limit) * 1000) / 10,
        overBudget: spent > b.monthly_limit,
      };
    }),
  };
}
