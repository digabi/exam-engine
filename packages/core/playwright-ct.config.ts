import { defineConfig, devices } from '@playwright/experimental-ct-react'
import { resolve } from 'path'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './__tests__/playwright',
  timeout: 10 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctTemplateDir: './__tests__/playwright/template',
    ctViteConfig: {
      resolve: {
        alias: {
          '~@digabi': resolve(__dirname, '../../node_modules/@digabi'),
          '~rich-text-editor': resolve(__dirname, '../../node_modules/rich-text-editor')
        }
      }
    }
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    }
  ]
})
