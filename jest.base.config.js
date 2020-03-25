module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  reporters: ['default', ['jest-junit', { outputName: 'jest-report.xml' }]],
  snapshotSerializers: ['jest-snapshot-serializer-raw'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/test*.ts?(x)', '<rootDir>/__tests__/**/*.test.ts?(x)']
}
