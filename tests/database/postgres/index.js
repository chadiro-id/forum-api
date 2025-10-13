const pool = require('../../../src/Infrastructures/database/postgres/pool');

const authenticationsTableHelper = require('./authenticationsTable');
const usersTableHelper = require('./usersTable');
const threadsTableHelper = require('./threadsTable');
const commentsTableHelper = require('./commentsTable');

module.exports = {
  usersTable: usersTableHelper(pool),
  authenticationsTable: authenticationsTableHelper(pool),
  threadsTable: threadsTableHelper(pool),
  commentsTable: commentsTableHelper(pool),
};
