class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.replyId = payload.replyId;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { threadId, commentId, replyId, owner } = payload;

    if (!threadId || !commentId || !replyId || !owner) {
      throw new Error('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof replyId !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('DELETE_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReply;