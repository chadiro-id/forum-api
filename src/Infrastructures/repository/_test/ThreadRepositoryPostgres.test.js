const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  describe('ThreadRepository contract enforcement', () => {
    it('must be an instance of ThreadRepository', () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, () => '');

      expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
    });
  });
});