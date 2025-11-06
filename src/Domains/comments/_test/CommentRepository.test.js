const CommentRepository = require('../CommentRepository');

describe('CommentRepository', () => {
  it('should throw error with properly message when abstract method invoked', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.addComment())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.getCommentsByThreadId())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.getCommentForDeletion())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.softDeleteCommentById())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.isCommentExist())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});