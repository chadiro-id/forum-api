const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  describe('Fails execution', () => {
    it('should throw error when the given payload is incorrect', async () => {
      const getDetailThreadUse = new GetDetailThreadUseCase({});

      await expect(getDetailThreadUse.execute())
        .rejects.toThrow();
    });
  });
});