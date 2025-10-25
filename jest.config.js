/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
  ],
  testMatch: [
    '**/?(*.)+(test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

module.exports = config;
