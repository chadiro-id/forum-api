const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository', () => {
  it('should throw error with properly message when abstract method invoked', async () => {
    const threadRepository = new ThreadRepository();

    await expect(threadRepository.addThread({}))
      .rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.getDetailThread(''))
      .rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.verifyThreadExists(''))
      .rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});