const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  it('must be an instance of ThreadRepository', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({});

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });
});