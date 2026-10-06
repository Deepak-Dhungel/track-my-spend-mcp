import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http, { type Server } from "http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { startHttpServer } from "../src/http.js";

const PORT = 39871;
const TOKEN = "test-token";
const URL_ = `http://127.0.0.1:${PORT}/mcp`;
let httpServer: Server;

beforeAll(async () => {
  httpServer = startHttpServer({ host: "127.0.0.1", port: PORT, authToken: TOKEN });
  await new Promise((resolve) => httpServer.once("listening", resolve));
});
afterAll(() => new Promise((resolve) => httpServer.close(resolve)));

function connect(token?: string) {
  const client = new Client({ name: "http-test", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(URL_), {
    requestInit: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
  return client.connect(transport).then(() => client);
}

describe("Streamable HTTP transport", () => {
  it("serves tools to an authorized MCP client", async () => {
    const client = await connect(TOKEN);
    const result: any = await client.callTool({
      name: "add_transaction",
      arguments: { amount: 12.5, category: "Food", date: "2026-10-05" },
    });
    expect(result.structuredContent.transaction.amount).toBe(12.5);
    await client.close();
  });

  it("rejects a missing or wrong token", async () => {
    await expect(connect()).rejects.toThrow();
    await expect(connect("wrong-token")).rejects.toThrow();
  });

  it("rejects a foreign Host header (DNS rebinding protection)", async () => {
    // fetch() silently drops a custom Host header, so use the http module
    const status = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port: PORT,
          path: "/mcp",
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            Host: "evil.example.com",
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
          },
        },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        }
      );
      req.on("error", reject);
      req.end(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }));
    });
    expect(status).toBe(403);
  });

  it("answers the health check", async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/health`);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
