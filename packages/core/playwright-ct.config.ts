import { defineConfig } from '@playwright/experimental-ct-react'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './__tests__/playwright',
  timeout: 10 * 1000,
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctTemplateDir: './__tests__/playwright/template'
  },
  projects: [
    {
      name: 'component',
      use: { viewport: { width: 800, height: 600 } }
    }
  ]
})
