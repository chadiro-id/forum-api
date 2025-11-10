const CommentRepository = require('../CommentRepository');

describe('CommentRepository', () => {
  const commentRepository = new CommentRepository();
  const methods = [
    commentRepository.addComment,
    commentRepository.getCommentsByThreadId,
    commentRepository.getCommentForDeletion,
    commentRepository.softDeleteCommentById,
    commentRepository.isCommentExist,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn())
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});