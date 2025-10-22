const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');

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
    const { threadId, commentId, replyId, owner } = new DeleteReply(payload);

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentBelongToThread(commentId, threadId);
    await this._replyRepository.verifyDeleteReply(replyId, commentId, owner);
    await this._replyRepository.softDeleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;