module.exports = {
  extends: '@digabi/eslint-config',
  parserOptions: {
    project: ['./packages/*/tsconfig.json', './packages/*/__tests__/tsconfig.json', 'tsconfig.eslint.json']
  },
  ignorePatterns: ['packages/*/dist', '**/node_modules', '**/main.js'],
  overrides: [
    {
      files: ['packages/*/__tests__/**/*.{ts,tsx}'],
      excludedFiles: ['packages/core/__tests__/playwright/**'],
      extends: ['plugin:@vitest/legacy-recommended'],
      rules: {
        '@vitest/expect-expect': 'off'
      }
    }
  ]
}
