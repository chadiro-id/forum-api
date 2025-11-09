const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const { threadId, commentId, replyId, userId } = new DeleteReply(payload);

    const reply = await this._replyRepository.getReplyForDeletion(replyId, commentId, threadId);
    if (reply === null) {
      throw new Error('DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND');
    }

    if (reply.owner !== userId) {
      throw new Error('DELETE_REPLY_USE_CASE.OWNER_NOT_MATCH');
    }

    await this._replyRepository.softDeleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;