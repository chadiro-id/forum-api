/* istanbul ignore file */
const pool = require('../../../src/Infrastructures/database/postgres/pool');

const authentications = require('./authentications');
const users = require('./users');
const threads = require('./threads');
const comments = require('./comments');
const replies = require('./replies');

module.exports = {
  usersTable: users(pool),
  authenticationsTable: authentications(pool),
  threadsTable: threads(pool),
  commentsTable: comments(pool),
  repliesTable: replies(pool),
};
