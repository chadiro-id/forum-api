const { Pool } = require('pg');

const AuthenticationsTable = require('./AuthenticationsTable');
const UsersTable = require('./UsersTable');
const ThreadsTable = require('./ThreadsTable');

const pool = new Pool();

module.exports = {
  authenticationsTable: new AuthenticationsTable(pool),
  usersTable: new UsersTable(pool),
  threadsTable: new ThreadsTable(pool),
};