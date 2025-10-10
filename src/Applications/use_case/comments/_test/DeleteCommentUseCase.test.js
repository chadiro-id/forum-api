const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  describe('fails execution', () => {
    it('should throw error when the given payload is bad', async () => {
      const deleteCommentUseCase = new DeleteCommentUseCase();

      await expect(deleteCommentUseCase.execute())
        .rejects.toThrow();
      await expect(deleteCommentUseCase.execute(''))
        .rejects.toThrow();
      await expect(deleteCommentUseCase.execute({}))
        .rejects.toThrow();
    });
  });
});