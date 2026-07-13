import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.{ts,tsx}",
  // o primeiro load de cada worker paga o boot frio do Vite dev server,
  // que sob paralelismo passa fácil dos 30s padrão
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // vários browsers carregando o grafo de módulos do Vite dev ao mesmo
  // tempo (com vídeo ligado) travam o evento load de forma intermitente —
  // serial é mais lento, porém estável
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    video: "on",
  },

  projects: [
    {
      name: "setup",
      testMatch: /warmup\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], video: "off" },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
