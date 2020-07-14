const base = require('../../jest.base.config')

module.exports = {
  ...base,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  transformIgnorePatterns: ['/node_modules/(?!(rich-text-editor))'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
}
