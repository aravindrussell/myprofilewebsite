import { defineConfig, devices } from "@playwright/test";
import { ADMIN_WEB_PORT, PUBLIC_PORT } from "./e2e/support/env";

const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e/tests",
  // The admin project shares one content file, so tests run one at a time.
  workers: 1,
  fullyParallel: false,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "public",
      testDir: "./e2e/tests/public",
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PUBLIC_PORT}` },
    },
    {
      name: "public-mobile",
      testDir: "./e2e/tests/public",
      testMatch: /home\.spec\.ts/,
      use: { ...devices["Pixel 7"], baseURL: `http://localhost:${PUBLIC_PORT}` },
    },
    {
      name: "admin",
      testDir: "./e2e/tests/admin",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1600, height: 1000 },
        baseURL: `http://localhost:${ADMIN_WEB_PORT}`,
      },
    },
  ],
  webServer: [
    {
      // The production build, exactly as Vercel would serve it.
      command: `npm run build && npx vite preview --port ${PUBLIC_PORT} --strictPort`,
      url: `http://localhost:${PUBLIC_PORT}`,
      reuseExistingServer: !ci,
      timeout: 180_000,
    },
    {
      command: "node e2e/support/admin-stack.mjs",
      url: `http://localhost:${ADMIN_WEB_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
