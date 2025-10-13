module.exports = {
  ...require('./jest.config'),
  testMatch: [
    '**/*.test.js',
    '!**/*.integration.test.js',
  ],
};
