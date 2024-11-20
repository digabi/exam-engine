module.exports = {
  extends: '@digabi/eslint-config',
  parserOptions: {
    project: ['./packages/*/tsconfig.json', './packages/*/__tests__/tsconfig.json', 'tsconfig.eslint.json']
  },
  ignorePatterns: ['packages/*/dist', '**/node_modules', '**/main-bundle.js']
}
