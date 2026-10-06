import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/mcpServer.js";
import { db } from "../src/db/connection.js";

// Connect a real MCP client to the server in-process
export async function connectClient() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer();
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  async function call(name: string, args: Record<string, unknown> = {}) {
    const result: any = await client.callTool({ name, arguments: args });
    return {
      isError: Boolean(result.isError),
      text: result.content?.[0]?.text as string,
      data: result.structuredContent as any,
    };
  }

  return { client, call, close: () => client.close() };
}

export function resetDb() {
  db.exec("DELETE FROM transactions; DELETE FROM budgets;");
}
