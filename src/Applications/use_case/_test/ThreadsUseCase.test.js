const ThreadsUseCase = require('../ThreadsUseCase');

describe('ThreadsUseCase', () => {
  describe('when addThread method invoked', () => {
    it('should throw error if the credential id is missing', async () => {
      const useCase = new ThreadsUseCase({});

      await expect(useCase.addThread())
        .rejects
        .toThrow('THREADS_USE_CASE.MISSING_CREDENTIAL_ID');
      await expect(useCase.addThread(null))
        .rejects
        .toThrow('THREADS_USE_CASE.MISSING_CREDENTIAL_ID');
    });

    it('should throw error if the given credential id is not a string', async () => {
      const useCase = new ThreadsUseCase({});

      await expect(useCase.addThread(123))
        .rejects
        .toThrow('THREADS_USE_CASE.CREDENTIAL_ID_MUST_BE_A_STRING');
    });
  });
});