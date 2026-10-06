import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { connectClient, resetDb } from "./helpers.js";

let mcp: Awaited<ReturnType<typeof connectClient>>;

beforeAll(async () => {
  mcp = await connectClient();
});
afterAll(() => mcp.close());
beforeEach(() => resetDb());

describe("set_budget", () => {
  it("creates and then replaces a budget (category is case-insensitive)", async () => {
    await mcp.call("set_budget", { category: "Food", monthlyLimit: 500 });
    const res = await mcp.call("set_budget", { category: "food", monthlyLimit: 450 });
    expect(res.data.budget.monthlyLimit).toBe(450);

    const all = await mcp.call("get_budget", { month: "2026-10" });
    expect(all.data.budgets).toHaveLength(1);
  });

  it("rejects a zero or negative limit", async () => {
    expect((await mcp.call("set_budget", { category: "Food", monthlyLimit: 0 })).isError).toBe(true);
    expect((await mcp.call("set_budget", { category: "Food", monthlyLimit: -1 })).isError).toBe(true);
  });
});

describe("get_budget", () => {
  beforeEach(async () => {
    await mcp.call("set_budget", { category: "Food", monthlyLimit: 100 });
    await mcp.call("set_budget", { category: "Fun", monthlyLimit: 50 });
    await mcp.call("add_transaction", { amount: 40, category: "Food", date: "2026-10-03" });
    await mcp.call("add_transaction", { amount: 75, category: "Fun", date: "2026-10-04" });
    await mcp.call("add_transaction", { amount: 999, category: "Food", date: "2026-09-04" });
  });

  it("reports spending against each budget for the month", async () => {
    const res = await mcp.call("get_budget", { month: "2026-10" });
    expect(res.data.budgets).toEqual([
      { category: "Food", monthlyLimit: 100, spent: 40, remaining: 60, percentUsed: 40, overBudget: false },
      { category: "Fun", monthlyLimit: 50, spent: 75, remaining: -25, percentUsed: 150, overBudget: true },
    ]);
    expect(res.text).toMatch(/over by \$25\.00/);
  });

  it("returns a single category", async () => {
    const res = await mcp.call("get_budget", { category: "food", month: "2026-10" });
    expect(res.data.budgets).toHaveLength(1);
    expect(res.data.budgets[0].spent).toBe(40);
  });

  it("errors for a category with no budget", async () => {
    const res = await mcp.call("get_budget", { category: "Travel" });
    expect(res.isError).toBe(true);
    expect(res.text).toMatch(/No budget set/);
  });
});
