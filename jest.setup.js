const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env.test')) {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

global.__TEST__ = true;

process.env.TZ = 'UTC';

const originalLog = console.log;
beforeAll(() => {
  if (process.env.SILENT_TEST_LOGS === 'true') {
    console.log = () => {};
  }
});

afterAll(() => {
  console.log = originalLog;
});

// jest.mock('pg', () => {
//   const mClient = {
//     connect: jest.fn(),
//     query: jest.fn(),
//     end: jest.fn(),
//   };
//   const mPool = jest.fn(() => mClient);
//   return { Pool: mPool };
// });

