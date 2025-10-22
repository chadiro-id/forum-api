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
    await expect(commentRepository.verifyDeleteComment())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentBelongToThread())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentExists())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentOwner())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.softDeleteCommentById())
      .rejects
      .toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});