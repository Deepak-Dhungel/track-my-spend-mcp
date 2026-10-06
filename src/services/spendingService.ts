import { sumByCategory, sumTransactions } from "../db/queries.js";
import { resolvePeriod, roundMoney } from "./dates.js";

type PeriodInput = { month?: string; startDate?: string; endDate?: string };

export function getSpendingSummary(input: PeriodInput & { category?: string }) {
  const period = resolvePeriod(input);
  const { total, count } = sumTransactions({
    category: input.category,
    startDate: period.startDate ?? undefined,
    endDate: period.endDate ?? undefined,
  });
  return {
    period,
    category: input.category ?? null,
    total: roundMoney(total),
    count,
  };
}

export function getCategorySummary(input: PeriodInput) {
  const period = resolvePeriod(input);
  const rows = sumByCategory({
    startDate: period.startDate ?? undefined,
    endDate: period.endDate ?? undefined,
  });
  const total = roundMoney(rows.reduce((sum, r) => sum + r.total, 0));
  return {
    period,
    total,
    categories: rows.map((r) => ({
      category: r.category,
      total: roundMoney(r.total),
      count: r.count,
      percent: total ? Math.round((r.total / total) * 1000) / 10 : 0,
    })),
  };
}
