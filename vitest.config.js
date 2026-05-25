import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    exclude: ["node_modules/**"],
    testTimeout: 30000,
    hookTimeout: 60000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/server.js", "src/seed.js", "src/db/connect.js"],
      reporter: ["text", "html"],
      thresholds: { lines: 85, branches: 75, functions: 85, statements: 85 },
    },
  },
});
