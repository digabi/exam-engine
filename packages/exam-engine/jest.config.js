const base = require('../../jest.base.config')

module.exports = {
  ...base,
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  }
}
