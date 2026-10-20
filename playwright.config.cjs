const { defineConfig } = require("@playwright/test");
const PORT = 4173;
module.exports = defineConfig({
  testDir: "tests",
  testMatch: /.*\.spec\.cjs/,
  timeout: 60000,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: { command: `node tools/serve.cjs ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: true },
  projects: [
    { name: "chrome", use: { browserName: "chromium", channel: "chrome" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
