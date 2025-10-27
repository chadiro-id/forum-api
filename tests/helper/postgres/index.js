/* istanbul ignore file */
const pool = require('../../../src/Infrastructures/database/postgres/pool');

const authenticationsTableHelper = require('./authenticationsTableHelper');
const usersTableHelper = require('./usersTableHelper');
const threadsTableHelper = require('./threadsTableHelper');
const commentsTableHelper = require('./commentsTableHelper');
const repliesTableHelper = require('./repliesTableHelper');

exports.users = () => usersTableHelper(pool);
exports.authentications = () => authenticationsTableHelper(pool);
exports.threads = () => threadsTableHelper(pool);
exports.comments = () => commentsTableHelper(pool);
exports.replies = () => repliesTableHelper(pool);

exports.truncate = async () => {
  const queryText = 'TRUNCATE TABLE users, authentications, threads, comments, replies';
  await pool.query(queryText);
};

exports.end = async (clean = true) => {
  if (clean) {
    await this.truncate();
  }
  await pool.end();
};
