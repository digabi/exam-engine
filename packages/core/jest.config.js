const base = require('../../jest.base.config')

module.exports = {
  ...base,
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  },
  transform: {
    ...base.transform,
    '/node_modules/(sanitize-html|htmlparser2|dom-serializer|domelementtype|domhandler|domutils|entities)/': [
      '@swc-node/jest'
    ]
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom'
}
