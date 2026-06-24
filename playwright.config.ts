import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only, sin retries en local */
  retries: process.env.CI ? 2 : 0,

  /* En CI deja que Jenkins controle el paralelismo via sharding.
     En local usa 4 workers */
  workers: process.env.CI ? 1 : 4,

  /* Reporters: en CI añade junit para Jenkins, siempre html */
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
    /* Headless en CI, con cabeza en local para depurar */
    headless: !!process.env.CI,

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  /* Solo Chromium en CI para que vaya más rápido.
     En local los tres browsers */
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