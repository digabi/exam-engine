const base = require('../../jest.base.config')

module.exports = {
  ...base,
  setupFilesAfterEnv: ['./jest.setup.js'],
}
