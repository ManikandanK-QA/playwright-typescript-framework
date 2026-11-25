import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { env, normalizeUrl } from './src/config/env';
import { AUTH_FILE } from './src/config/paths';

const isCI = Boolean(process.env.CI);

/**
 * Project split by test layer, not just browser:
 *
 *  - `setup`    logs in once and writes storageState for the UI projects
 *  - `chromium` / `firefox` / `webkit` run UI specs only
 *  - `api`      runs REST specs with no browser at all
 *  - `a11y`     runs axe-core scans on a single browser
 *
 * This prevents the common anti-pattern of executing API tests three times,
 * once per browser.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/artifacts',
  globalSetup: './tests/setup/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45_000,

  expect: {
    timeout: 7_000,
  },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],

  use: {
    baseURL: normalizeUrl(env.BASE_URL),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    testIdAttribute: 'data-test',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'chromium',
      testIgnore: [/setup\//, /api\//, /a11y\//],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
    },
    {
      name: 'firefox',
      testIgnore: [/setup\//, /api\//, /a11y\//],
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
    },
    {
      name: 'webkit',
      testIgnore: [/setup\//, /api\//, /a11y\//],
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
    },

    {
      name: 'api',
      testMatch: /api\//,
      use: {
        baseURL: normalizeUrl(env.API_BASE_URL),
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },

    {
      name: 'a11y',
      testMatch: /a11y\//,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
  ],
});
