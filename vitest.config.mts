import { defineConfig, TestProjectInlineConfiguration } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    testTimeout: 30000,
    reporters: ['default', ['junit', { outputFile: 'vitest-report.xml' }]],
    projects: [
      project('cli'),
      project('core', {
        exclude: ['packages/core/__tests__/playwright/**'],
        environment: 'jsdom'
      }),
      project('generator'),
      project('mastering'),
      project('rendering', {
        testTimeout: 120000
      })
    ]
  }
})

function project(name: string, options: TestProjectInlineConfiguration['test'] = {}) {
  return {
    extends: true as const,
    test: {
      name,
      include: [
        `packages/${name}/__tests__/**/test*.ts`,
        `packages/${name}/__tests__/**/test*.tsx`,
        `packages/${name}/__tests__/**/*.test.ts`,
        `packages/${name}/__tests__/**/*.test.tsx`
      ],
      ...options
    }
  }
}
