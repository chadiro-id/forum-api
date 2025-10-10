const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  describe('fails execution', () => {
    it('should throw error when the given payload is bad', async () => {
      const addCommentUseCase = new AddCommentUseCase({});

      await expect(addCommentUseCase.execute())
        .rejects.toThrow();
      await expect(addCommentUseCase.execute(''))
        .rejects.toThrow();
      await expect(addCommentUseCase.execute({}))
        .rejects.toThrow();
    });
  });
});