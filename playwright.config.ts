import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export const STORAGE_STATE = 'playwright/.auth/standard_user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  expect: { timeout: 10_000 }, // public demo site can be slow under parallel load
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    testIdAttribute: 'data-test', // SauceDemo tags elements with data-test="..."
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Logs in once and saves the session so other tests start already signed in
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE }, dependencies: ['setup'] },
    // Defect-detection suite runs once, on Chromium; other browsers run the functional suites
    { name: 'firefox', use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE }, dependencies: ['setup'], testIgnore: /known-defects/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE }, dependencies: ['setup'], testIgnore: /known-defects/ },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
      grep: /@smoke/, // mobile runs the smoke subset only
    },
  ],
});
