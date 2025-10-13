module.exports = {
  ...require('./jest.config'),
  testMatch: [
    '**/*.integration.test.js',
  ],
  testTimeout: 20000,
};
