class NewComment {
  /**
   * New Comment Entity constructor
   * @param {Object} payload
   * @property {string} threadId
   * @property {string} content
   * @property {string} userId
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.content = payload.content;
    this.userId = payload.userId;
  }

  _verifyPayload(payload) {
    const { threadId, content, userId } = payload;

    if (!threadId || !content || !userId) {
      throw new Error('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof content !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;