import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { connectClient, resetDb } from "./helpers.js";
import { today } from "../src/services/dates.js";

let mcp: Awaited<ReturnType<typeof connectClient>>;

beforeAll(async () => {
  mcp = await connectClient();
});
afterAll(() => mcp.close());
beforeEach(() => resetDb());

describe("tool list", () => {
  it("exposes the seven tools from the architecture doc", async () => {
    const { tools } = await mcp.client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "add_transaction",
      "get_budget",
      "get_category_summary",
      "get_spending_summary",
      "get_transactions",
      "search_transactions",
      "set_budget",
    ]);
  });
});

describe("add_transaction", () => {
  it("stores a transaction and returns it", async () => {
    const res = await mcp.call("add_transaction", {
      amount: 18.42,
      category: "Food",
      description: "Chipotle",
      date: "2026-10-05",
    });
    expect(res.isError).toBe(false);
    expect(res.data.transaction).toMatchObject({
      amount: 18.42,
      category: "Food",
      description: "Chipotle",
      date: "2026-10-05",
    });
  });

  it("defaults the date to today in local time", async () => {
    const res = await mcp.call("add_transaction", { amount: 5, category: "Coffee" });
    expect(res.data.transaction.date).toBe(today());
  });

  it.each([
    [{ amount: 0, category: "Food" }],
    [{ amount: -3, category: "Food" }],
    [{ amount: 5, category: "   " }],
    [{ amount: 5, category: "Food", date: "2026-02-30" }],
    [{ amount: 5, category: "Food", date: "10/05/2026" }],
  ])("rejects invalid input %j", async (args) => {
    const res = await mcp.call("add_transaction", args);
    expect(res.isError).toBe(true);
  });
});

describe("get_transactions", () => {
  beforeEach(async () => {
    await mcp.call("add_transaction", { amount: 10, category: "Food", date: "2026-09-30" });
    await mcp.call("add_transaction", { amount: 20, category: "Food", date: "2026-10-01" });
    await mcp.call("add_transaction", { amount: 30, category: "Travel", date: "2026-10-02" });
  });

  it("lists newest first with a total", async () => {
    const res = await mcp.call("get_transactions");
    expect(res.data.count).toBe(3);
    expect(res.data.total).toBe(60);
    expect(res.data.transactions.map((t: any) => t.date)).toEqual([
      "2026-10-02",
      "2026-10-01",
      "2026-09-30",
    ]);
  });

  it("filters by category case-insensitively and by date range", async () => {
    const res = await mcp.call("get_transactions", {
      category: "food",
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });
    expect(res.data.count).toBe(1);
    expect(res.data.total).toBe(20);
  });

  it("respects the limit", async () => {
    const res = await mcp.call("get_transactions", { limit: 2 });
    expect(res.data.count).toBe(2);
  });

  it("rejects a start date after the end date", async () => {
    const res = await mcp.call("get_transactions", {
      startDate: "2026-10-31",
      endDate: "2026-10-01",
    });
    expect(res.isError).toBe(true);
    expect(res.text).toMatch(/startDate/);
  });
});

describe("search_transactions", () => {
  it("matches description text and treats % and _ literally", async () => {
    await mcp.call("add_transaction", { amount: 40, category: "Shopping", description: "Amazon order" });
    await mcp.call("add_transaction", { amount: 15, category: "Food", description: "100% juice" });
    await mcp.call("add_transaction", { amount: 9, category: "Food", description: "Bagel" });

    const amazon = await mcp.call("search_transactions", { query: "amazon" });
    expect(amazon.data.count).toBe(1);

    const percent = await mcp.call("search_transactions", { query: "%" });
    expect(percent.data.count).toBe(1);
    expect(percent.data.transactions[0].description).toBe("100% juice");
  });
});
