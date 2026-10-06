import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcpServer.js";
import { startHttpServer } from "./http.js";

// stdio (default): used by Claude Desktop and other local AI clients
// --http: Streamable HTTP, used by the TrackMySpend web app
async function main() {
  const useHttp =
    process.argv.includes("--http") || process.env.MCP_TRANSPORT === "http";

  if (useHttp) {
    startHttpServer({
      host: process.env.HOST || "127.0.0.1",
      port: Number(process.env.PORT) || 3001,
      authToken: process.env.MCP_AUTH_TOKEN || undefined,
    });
    return;
  }

  const server = createServer();
  await server.connect(new StdioServerTransport());
  console.error("TrackMySpend MCP server running on stdio");
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
