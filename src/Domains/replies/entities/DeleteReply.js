class DeleteReply {
  /**
   * Delete Reply Entity constructor
   * @param {Object} payload
   * @property {string} threadId
   * @property {string} commentId
   * @property {string} replyId
   * @property {string} userId
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.replyId = payload.replyId;
    this.userId = payload.userId;
  }

  _verifyPayload(payload) {
    const { threadId, commentId, replyId, userId } = payload;

    if (!threadId || !commentId || !replyId || !userId) {
      throw new Error('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof replyId !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error('DELETE_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReply;