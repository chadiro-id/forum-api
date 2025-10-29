/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
      functions: 90,
      branches: 80,
    },
    './src/Domains/**': {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    },
    './src/Applications/**': {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    },
  },
  testMatch: [
    '**/?(*.)+(test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/helper/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

module.exports = config;
