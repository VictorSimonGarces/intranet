import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: 0,

  // Retries: 2 on CI, 0 locally
  retries: process.env.CI ? 2 : 0,

  // Workers: controlled by CI when running in sharded mode, otherwise 4 locally
  workers: process.env.CI ? 1 : 4,

  reporter: process.env.CI
    ? [
        ['junit', { outputFile: 'test-results/results.xml' }],
        ['html', { open: 'never' }],
        ['list'],
      ]
    : [
        ['html', { open: 'on-failure' }],
        ['list'],
      ],

  globalTeardown: require.resolve('./global-teardown'),

  use: {
    headless: !!process.env.CI,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ],
});