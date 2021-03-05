module.exports = {
  extends: '@digabi/eslint-config',
  parserOptions: {
    project: ['./packages/*/tsconfig.json', './packages/*/__tests__/tsconfig.json'],
  },
  ignorePatterns: ['packages/*/dist', '**/node_modules'],
}
