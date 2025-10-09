const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor() {
    super();
  }
}

module.exports = ThreadRepositoryPostgres;