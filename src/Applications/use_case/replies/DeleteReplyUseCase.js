const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const { threadId, commentId, replyId, owner } = new DeleteReply(payload);

    const reply = await this._replyRepository.getReplyForDeletion(replyId, commentId, threadId);
    this._verifyReplyDeletion(reply);

    if (reply.owner !== owner) {
      throw new Error('DELETE_REPLY_USE_CASE.OWNER_NOT_MATCH');
    }

    await this._replyRepository.softDeleteReplyById(replyId);
  }

  _verifyReplyDeletion(reply) {
    if (reply === null) {
      throw new Error('DELETE_REPLY_USE_CASE.REPLY_NOT_EXIST');
    }

    if (!reply.owner || typeof reply.owner !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.REPLY_OWNER_MUST_NON_EMPTY_STRING');
    }
  }
}

module.exports = DeleteReplyUseCase;