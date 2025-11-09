const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    const { threadId, commentId, owner } = new DeleteComment(payload);

    const comment = await this._commentRepository.getCommentForDeletion(commentId, threadId);
    if (comment === null) {
      throw new Error('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
    }
    if (comment.owner !== owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.OWNER_NOT_MATCH');
    }

    await this._commentRepository.softDeleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;