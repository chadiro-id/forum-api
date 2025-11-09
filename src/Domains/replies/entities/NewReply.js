class NewReply {
  /**
   * New Reply Entity constructor
   * @param {Object} payload
   * @property {string} threadId
   * @property {string} commentId
   * @property {string} content
   * @property {string} userId
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.content = payload.content;
    this.userId = payload.userId;
  }

  _verifyPayload(payload) {
    const { threadId, commentId, content, userId } = payload;

    if (!threadId || !commentId || !content || !userId) {
      throw new Error('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof content !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error('NEW_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewReply;