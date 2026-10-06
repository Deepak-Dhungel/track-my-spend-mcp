import type { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface ToolDefinition<
  I extends z.ZodObject<any> = z.ZodObject<any>,
  O extends z.ZodObject<any> = z.ZodObject<any>
> {
  name: string;
  title: string;
  description: string;
  inputSchema: I;
  outputSchema: O;
  handler: (args: z.infer<I>) => Promise<CallToolResult>;
}

// Helper so each tool gets typed args without repeating generics
export function defineTool<I extends z.ZodObject<any>, O extends z.ZodObject<any>>(
  tool: ToolDefinition<I, O>
) {
  return tool;
}

// Text for people/LLMs plus structured data for programmatic clients
export function result(text: string, data: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: "text", text }],
    structuredContent: data,
  };
}

// Business-rule errors go back to the client as tool errors, not crashes
export function errorResult(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}

export function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}
