import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { addExpenseTool } from "./tools/addExpense.js";

// Create server instance
const server = new McpServer({
  name: "TrackMySpend",
  version: "1.0.0",
});

//register all tool
const tools = [addExpenseTool]

tools.forEach ((tool) => {
    server.registerTool(
        tool.name,
        {
            description: tool.description,
            inputSchema: tool.inputSchema,
        },
        tool.handler)
        }
    )
})

// server.registerTool(
//   "add_expense",
//   {
//     description: "Add a new expense to track spending",
//     inputSchema: z.object({
//       amount: z.number().min(0),
//       category: z.string().min(1),
//       description: z.string().optional(),
//       date: z.string().optional(),
//     }),
//   },
//   async ({ amount, category, description, date }) => {
//     return {
//       content: [
//         {
//           type: "text",
//           text: `Added expense for ${amount} in the category ${category}`,
//         },
//       ],
//     };
//   }
// );

// running the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Server started");
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
