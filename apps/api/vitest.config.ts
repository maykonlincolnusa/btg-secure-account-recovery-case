import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.spec.ts"]
  },
  resolve: {
    alias: {
      "@secure-recovery/domain": "../../packages/domain/src/index.ts",
      "@secure-recovery/contracts": "../../packages/contracts/src/index.ts",
      "@secure-recovery/utils": "../../packages/utils/src/index.ts"
    }
  }
});
