import { defineConfig } from '@playwright/test';

// Same mocked e2e suites, but running against the PRODUCTION build served by
// `vite preview` on port 4173 — reproduces the user's preview-based testing.
export default defineConfig({
  testDir: '/Users/jakaria/Desktop/ClothingEcommerce/frontend/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
