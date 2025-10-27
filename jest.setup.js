const dotenv = require('dotenv');
const fs = require('fs');

// setup test environment .env.test if exists
if (fs.existsSync('.env.test')) {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

// default time zone for consistency
process.env.TZ = 'UTC';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // for dynamic module import
  jest.resetModules();
});

const originalLog = console.log;
beforeAll(() => {
  if (process.env.SILENT_TEST_LOGS === 'true') {
    // disable log
    console.log = () => {};
  }
});

afterAll(() => {
  // restore log
  console.log = originalLog;
});

