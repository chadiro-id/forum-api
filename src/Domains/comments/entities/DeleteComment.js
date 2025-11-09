class DeleteComment {
  /**
   * Delete Comment Entity constructor
   * @param {Object} payload
   * @property {string} threadId
   * @property {string} commentId
   * @property {string} userId
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.userId = payload.userId;
  }

  _verifyPayload(payload) {
    const { threadId, commentId, userId } = payload;

    if (!threadId || !commentId || !userId) {
      throw new Error('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;