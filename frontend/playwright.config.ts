import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  timeout: 30000,
  expect: {
    timeout: 8000,
  },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3005",
    channel: "msedge",
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: "npx next start -p 3005",
    url: "http://127.0.0.1:3005",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
