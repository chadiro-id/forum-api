const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository', () => {
  const threadRepository = new ThreadRepository();
  const methods = [
    threadRepository.addThread,
    threadRepository.getThreadDetails,
    threadRepository.isThreadExist,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn()).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});