const base = require('../../jest.base.config')

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  }
}
