module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  setupFiles: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  moduleNameMapper: {
    '^redis$': '<rootDir>/__mocks__/redis.js',
    '^nodemailer$': '<rootDir>/__mocks__/nodemailer.js',
  },
};
