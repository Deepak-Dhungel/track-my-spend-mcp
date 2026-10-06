import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  addTransactionTool,
  getTransactionsTool,
  searchTransactionsTool,
} from "./tools/transactions.js";
import { getCategorySummaryTool, getSpendingSummaryTool } from "./tools/spending.js";
import { getBudgetTool, setBudgetTool } from "./tools/budgets.js";
import type { ToolDefinition } from "./tools/types.js";

const tools: ToolDefinition<any, any>[] = [
  addTransactionTool,
  getTransactionsTool,
  searchTransactionsTool,
  getSpendingSummaryTool,
  getCategorySummaryTool,
  getBudgetTool,
  setBudgetTool,
];

// Build a server with every tool registered. Each transport gets its own instance.
export function createServer() {
  const server = new McpServer({ name: "TrackMySpend", version: "1.0.0" });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      },
      tool.handler
    );
  }

  return server;
}
