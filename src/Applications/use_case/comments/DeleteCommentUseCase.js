const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    const { threadId, commentId, owner } = new DeleteComment(payload);

    const comment = await this._commentRepository.getCommentForDeletion(commentId, threadId);
    this._verifyCommentDeletion(comment);

    if (comment.owner !== owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.OWNER_NOT_MATCH');
    }

    await this._commentRepository.softDeleteCommentById(commentId);
  }

  _verifyCommentDeletion(comment) {
    if (comment === null) {
      throw new Error('DELETE_COMMENT_USE_CASE.COMMENT_NOT_EXIST');
    }

    if (!comment.owner || typeof comment.owner !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.COMMENT_OWNER_MUST_NON_EMPTY_STRING');
    }
  }
}

module.exports = DeleteCommentUseCase;