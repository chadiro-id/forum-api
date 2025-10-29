/* istanbul ignore file */
const pool = require('../../../src/Infrastructures/database/postgres/pool');

const authenticationsTableHelper = require('./authenticationsTableHelper');
const usersTableHelper = require('./usersTableHelper');
const threadsTableHelper = require('./threadsTableHelper');
const commentsTableHelper = require('./commentsTableHelper');
const repliesTableHelper = require('./repliesTableHelper');

const getPool = () => pool;

const users = usersTableHelper(pool);
const authentications = authenticationsTableHelper(pool);
const threads = threadsTableHelper(pool);
const comments = commentsTableHelper(pool);
const replies = repliesTableHelper(pool);

const truncate = async () => async () => {
  const queryText = 'TRUNCATE TABLE users, authentications, threads, comments, replies';
  await pool.query(queryText);
};

const end = async () => {
  await pool.end();
};

module.exports = {
  getPool,
  users,
  authentications,
  threads,
  comments,
  replies,
  truncate,
  end,
};