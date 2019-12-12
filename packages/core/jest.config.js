const base = require('../../jest.base.config')

module.exports = {
  ...base,
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom'
}
