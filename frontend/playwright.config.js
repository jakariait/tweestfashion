import { defineConfig } from '@playwright/test';

// E2E tests run against the Vite dev server and mock ALL backend API calls,
// so they are fully deterministic — no backend/DB/Redis required.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  // start the dev server automatically if not already running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
