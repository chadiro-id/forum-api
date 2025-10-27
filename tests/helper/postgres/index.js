/* istanbul ignore file */

const authenticationsTableHelper = require('./authenticationsTableHelper');
const usersTableHelper = require('./usersTableHelper');
const threadsTableHelper = require('./threadsTableHelper');
const commentsTableHelper = require('./commentsTableHelper');
const repliesTableHelper = require('./repliesTableHelper');

class PostgresTestHelper {
  constructor(pool) {
    this._pool = pool;
    this._users = usersTableHelper(pool);
    this._authentications = authenticationsTableHelper(pool);
    this._threads = threadsTableHelper(pool);
    this._comments = commentsTableHelper(pool);
    this._replies = repliesTableHelper(pool);
  }

  users() {
    return this._users;
  }

  authentications() {
    return this._authentications;
  }

  threads() {
    return this._threads;
  }

  comments() {
    return this._comments;
  }

  replies() {
    return this._replies;
  }

  async truncate() {
    const queryText = 'TRUNCATE TABLE users, authentications, threads, comments, replies';
    await this._pool.query(queryText);
  }

  async end(clean = true) {
    if (clean) {
      await this.truncate();
    }
    await this._pool.end();
  }
}

module.exports = PostgresTestHelper;
