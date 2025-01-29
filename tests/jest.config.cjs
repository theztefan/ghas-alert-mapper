// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts', 'mjs'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@octokit|universal-user-agent|before-after-hook|@octokit.*)/)'
  ],
  transform: {
    '^.+\\.(ts|js|mjs)$': 'babel-jest'
  }
}
