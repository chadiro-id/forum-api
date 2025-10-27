/* istanbul ignore file */
const pool = require('../../../src/Infrastructures/database/postgres/pool');

const authenticationsTableHelper = require('./authenticationsTableHelper');
const usersTableHelper = require('./usersTableHelper');
const threadsTableHelper = require('./threadsTableHelper');
const commentsTableHelper = require('./commentsTableHelper');
const repliesTableHelper = require('./repliesTableHelper');

module.exports = {
  usersTable: usersTableHelper(pool),
  authenticationsTable: authenticationsTableHelper(pool),
  threadsTable: threadsTableHelper(pool),
  commentsTable: commentsTableHelper(pool),
  repliesTable: repliesTableHelper(pool),
};
