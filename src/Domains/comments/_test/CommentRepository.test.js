const CommentRepository = require('../CommentRepository');

describe('CommentRepository', () => {
  it('should throw error with properly message when abstract method invoked', async () => {
    const expectedError = new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    const commentRepository = new CommentRepository();

    await expect(commentRepository.addComment({}))
      .rejects.toThrow(expectedError);
    await expect(commentRepository.verifyCommentExists(''))
      .rejects.toThrow(expectedError);
    await expect(commentRepository.verifyCommentOwner(''))
      .rejects.toThrow(expectedError);
    await expect(commentRepository.getCommentsByThreaId(''))
      .rejects.toThrow(expectedError);
    await expect(commentRepository.deleteCommentById(''))
      .rejects.toThrow(expectedError);
  });
});