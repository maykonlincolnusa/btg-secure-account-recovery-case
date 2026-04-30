import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.spec.ts"]
  },
  resolve: {
    alias: {
      "@secure-recovery/domain": resolve(__dirname, "../../packages/domain/src/index.ts"),
      "@secure-recovery/contracts": resolve(__dirname, "../../packages/contracts/src/index.ts"),
      "@secure-recovery/utils": resolve(__dirname, "../../packages/utils/src/index.ts")
    }
  }
});
