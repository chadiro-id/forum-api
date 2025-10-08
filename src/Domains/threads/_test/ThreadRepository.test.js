const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository', () => {
  describe('when abstract method invoked', () => {
    it('should throw error with properly message', async () => {
      const threadRepository = new ThreadRepository();

      await expect(threadRepository.addThread({}))
        .rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      await expect(threadRepository.getThreadById(''))
        .rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
  });
});