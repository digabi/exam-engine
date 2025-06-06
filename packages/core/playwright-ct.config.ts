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
      },
      // TODO: This should be refactored to only include the necessary parts i.e. the attachment folders within the exam folders so the tests have access to them.
      publicDir: resolve(__dirname, '../../packages/exams')
    }
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
        }
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: { 'media.navigator.streams.fake': true, 'media.navigator.permission.disabled': true }
        }
      }
    }
  ]
})
