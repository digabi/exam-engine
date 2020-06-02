const base = require('../../jest.base.config')

module.exports = {
  ...base,
  transformIgnorePatterns: ['/node_modules/(?!(lodash-es|rich-text-editor))'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
}
