module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  forceExit: true,
  detectOpenHandles: true
};
