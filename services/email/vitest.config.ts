import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // client.ts validates RESEND_KEY at module load — set a fake value so
    // importing it in tests doesn't throw. Tests never hit the real Resend
    // API; the "resend" module itself is mocked per test file.
    env: {
      RESEND_KEY: "test-resend-key",
    },
  },
});
