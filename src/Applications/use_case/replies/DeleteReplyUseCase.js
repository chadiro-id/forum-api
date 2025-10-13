class DeleteReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const {
      threadId, commentId, replyId, userId
    } = payload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    await this._replyRepository.verifyReplyOwner(replyId, userId);
    await this._replyRepository.softDeleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;