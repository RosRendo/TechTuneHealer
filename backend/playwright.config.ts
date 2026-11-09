import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.ts/,
  timeout: 30000,
  workers: 1, // Sequential execution ensures order of test states (login -> vehicle -> booking -> tracking -> payment)
  use: {
    baseURL: process.env.API_URL || "http://localhost:4000",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
});
