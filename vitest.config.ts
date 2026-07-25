import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    globalSetup: ["./tests/global-setup.ts"],
    // All test files share one SQLite file per D-007 ("a fresh SQLite file... migrated
    // from scratch at the start of the test run") — run files sequentially so their
    // fixture setup/teardown doesn't race on shared tables.
    fileParallelism: false,
  },
});
