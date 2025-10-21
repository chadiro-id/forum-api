const DeleteComent = require('../../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    const { threadId, commentId, owner } = new DeleteComent(payload);

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.softDeleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;