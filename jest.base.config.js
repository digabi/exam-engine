module.exports = {
  reporters: ['default', ['jest-junit', { outputName: 'jest-report.xml' }]],
  snapshotSerializers: ['jest-snapshot-serializer-raw'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(uuid))'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/playwright/'],
  testMatch: ['<rootDir>/__tests__/**/test*.ts?(x)', '<rootDir>/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc-node/jest'],
    '/packages/core/dist': ['@swc-node/jest'],
    '/node_modules/rich-text-editor': ['@swc-node/jest'],
    '/node_modules/uuid': ['@swc-node/jest']
  }
}
