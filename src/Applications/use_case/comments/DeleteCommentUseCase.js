const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    const { threadId, commentId, owner } = new DeleteComment(payload);

    const isThreadExist = await this._threadRepository.isThreadExist(threadId);
    if (!isThreadExist) {
      throw new Error('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND');
    }

    await this._commentRepository.verifyDeleteComment(commentId, threadId, owner);
    await this._commentRepository.softDeleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;