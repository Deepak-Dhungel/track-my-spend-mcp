import http from "http";
import { timingSafeEqual } from "crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./mcpServer.js";

const MAX_BODY_BYTES = 1_000_000;

function sendJsonRpcError(res: http.ServerResponse, status: number, message: string) {
  res.writeHead(status, { "Content-Type": "application/json" }).end(
    JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message }, id: null })
  );
}

// When MCP_AUTH_TOKEN is set, require "Authorization: Bearer <token>"
function isAuthorized(req: http.IncomingMessage, token: string | undefined) {
  if (!token) return true;
  const header = req.headers.authorization ?? "";
  const expected = Buffer.from(`Bearer ${token}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function readJsonBody(req: http.IncomingMessage) {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function startHttpServer(options: { host: string; port: number; authToken?: string }) {
  const { host, port, authToken } = options;
  const isLocal = ["127.0.0.1", "localhost", "::1"].includes(host);

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://placeholder");

    if (url.pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" }).end('{"status":"ok"}');
      return;
    }
    if (url.pathname !== "/mcp") {
      return sendJsonRpcError(res, 404, "Not found");
    }
    if (!isAuthorized(req, authToken)) {
      return sendJsonRpcError(res, 401, "Unauthorized");
    }
    // Stateless server: no sessions, so only POST is supported
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJsonRpcError(res, 405, "Method not allowed");
    }

    let body: unknown;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      return sendJsonRpcError(res, 400, `Invalid request body: ${(error as Error).message}`);
    }

    // A fresh server and transport per request keeps requests isolated
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      // Block DNS-rebinding attacks from web pages when running locally
      ...(isLocal && {
        enableDnsRebindingProtection: true,
        allowedHosts: [`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`],
      }),
    });
    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) sendJsonRpcError(res, 500, "Internal server error");
    }
  });

  httpServer.listen(port, host, () => {
    console.error(`TrackMySpend MCP server listening on http://${host}:${port}/mcp`);
    if (!authToken && !isLocal) {
      console.error("Warning: MCP_AUTH_TOKEN is not set and the server is not bound to localhost.");
    }
  });

  return httpServer;
}
