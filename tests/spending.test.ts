import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { connectClient, resetDb } from "./helpers.js";
import { today } from "../src/services/dates.js";

let mcp: Awaited<ReturnType<typeof connectClient>>;

beforeAll(async () => {
  mcp = await connectClient();
});
afterAll(() => mcp.close());

beforeEach(async () => {
  resetDb();
  await mcp.call("add_transaction", { amount: 10.1, category: "Food", date: "2026-10-01" });
  await mcp.call("add_transaction", { amount: 20.2, category: "food", date: "2026-10-31" });
  await mcp.call("add_transaction", { amount: 69.7, category: "Rent", date: "2026-10-15" });
  await mcp.call("add_transaction", { amount: 500, category: "Food", date: "2026-09-30" });
});

describe("get_spending_summary", () => {
  it("totals a whole month, including the last day", async () => {
    const res = await mcp.call("get_spending_summary", { month: "2026-10" });
    expect(res.data.total).toBe(100);
    expect(res.data.count).toBe(3);
    expect(res.data.period).toEqual({
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      label: "2026-10",
    });
  });

  it("totals one category without floating-point noise", async () => {
    const res = await mcp.call("get_spending_summary", { month: "2026-10", category: "FOOD" });
    expect(res.data.total).toBe(30.3);
  });

  it("supports a custom date range", async () => {
    const res = await mcp.call("get_spending_summary", {
      startDate: "2026-09-30",
      endDate: "2026-10-01",
    });
    expect(res.data.total).toBe(510.1);
  });

  it("defaults to the current month", async () => {
    await mcp.call("add_transaction", { amount: 7, category: "Coffee" });
    const res = await mcp.call("get_spending_summary");
    expect(res.data.period.label).toBe(today().slice(0, 7));
  });

  it("rejects mixing month with a date range", async () => {
    const res = await mcp.call("get_spending_summary", {
      month: "2026-10",
      startDate: "2026-10-01",
    });
    expect(res.isError).toBe(true);
  });

  it("rejects an invalid month", async () => {
    const res = await mcp.call("get_spending_summary", { month: "2026-13" });
    expect(res.isError).toBe(true);
  });
});

describe("get_category_summary", () => {
  it("groups categories case-insensitively, largest first, with percentages", async () => {
    const res = await mcp.call("get_category_summary", { month: "2026-10" });
    expect(res.data.total).toBe(100);
    expect(res.data.categories).toEqual([
      { category: "Rent", total: 69.7, count: 1, percent: 69.7 },
      { category: expect.stringMatching(/^food$/i), total: 30.3, count: 2, percent: 30.3 },
    ]);
  });

  it("returns an empty list for a month with no spending", async () => {
    const res = await mcp.call("get_category_summary", { month: "2020-01" });
    expect(res.isError).toBe(false);
    expect(res.data.categories).toEqual([]);
  });
});
