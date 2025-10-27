/* istanbul ignore file */

const authenticationsTableHelper = require('./authenticationsTableHelper');
const usersTableHelper = require('./usersTableHelper');
const threadsTableHelper = require('./threadsTableHelper');
const commentsTableHelper = require('./commentsTableHelper');
const repliesTableHelper = require('./repliesTableHelper');

let _pool;
let _users;
let _authentications;
let _threads;
let _comments;
let _replies;

exports.init = (pool) => {
  _pool = pool;
  _users = usersTableHelper(pool);
  _authentications = authenticationsTableHelper(pool);
  _threads = threadsTableHelper(pool);
  _comments = commentsTableHelper(pool);
  _replies = repliesTableHelper(pool);
};

exports.users = () => _users;
exports.authentications = () => _authentications;
exports.threads = () => _threads;
exports.comments = () => _comments;
exports.replies = () => _replies;

exports.truncate = async () => {
  const queryText = 'TRUNCATE TABLE users, authentications, threads, comments, replies';
  await _pool.query(queryText);
};

exports.end = async () => {
  this.truncate();
  await _pool.end();
};
