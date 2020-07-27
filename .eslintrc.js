module.exports = {
  extends: '@digabi/eslint-config',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.eslint.json',
  },
  ignorePatterns: ['packages/*/dist', '**/node_modules'],
}
