import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration.
 *
 * Tests run against a live dev server — Playwright starts it automatically
 * before the test suite runs and shuts it down afterwards.
 *
 * Run tests:
 *   npx playwright test              — headless (CI mode)
 *   npx playwright test --ui         — interactive UI mode
 *   npx playwright test --headed     — watch the browser
 *   npx playwright show-report       — view last HTML report
 */
export default defineConfig({
  testDir:   './tests',
  timeout:   30_000,       // 30s per test
  retries:   process.env.CI ? 2 : 0,  // retry flaky tests in CI
  workers:   process.env.CI ? 1 : undefined,
  reporter:  [['html', { open: 'never' }], ['list']],

  use: {
    baseURL:       'http://localhost:3000',
    trace:         'on-first-retry',   // record trace on first retry for debugging
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
  },

  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
    {
      name:  'mobile-chrome',
      use:   { ...devices['Pixel 5'] },
    },
  ],

  // Start the Vite dev server before running tests
  webServer: {
    command:           'npm run dev',
    url:               'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    cwd:               '../meet-hasammie-suah_frontend',
    timeout:           60_000,
    env: {
      VITE_API_URL:     process.env.VITE_API_URL     || 'http://localhost:4000/graphql',
      VITE_POSTHOG_KEY: '',
    },
  },
});
