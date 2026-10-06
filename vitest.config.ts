import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Every test file gets its own in-memory database
    env: { DB_PATH: ":memory:" },
  },
});
