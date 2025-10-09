const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  describe('fails execution', () => {
    it('should throw error when the first arg not a truthy string', async () => {
      const addCommentUseCase = new AddCommentUseCase({});

      await expect(addCommentUseCase.execute())
        .rejects.toThrow('ADD_COMMENT_USE_CASE.MISSING_USER_ID');
      await expect(addCommentUseCase.execute(''))
        .rejects.toThrow('ADD_COMMENT_USE_CASE.MISSING_USER_ID');
      await expect(addCommentUseCase.execute({}))
        .rejects.toThrow('ADD_COMMENT_USE_CASE.MISSING_USER_ID');
    });
  });
});