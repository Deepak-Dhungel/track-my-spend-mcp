import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { addExpenseTool } from "./tools/addExpense.js";

// Create server instance
const server = new McpServer({
  name: "TrackMySpend",
  version: "1.0.0",
});

//register all tool
const tools = [addExpenseTool];

tools.forEach((tool) => {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    tool.handler
  );
});

// running the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Server is running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
