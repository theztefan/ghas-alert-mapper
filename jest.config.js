module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!(@octokit|@actions)/)'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  testPathIgnorePatterns: ['/node_modules/']
}
