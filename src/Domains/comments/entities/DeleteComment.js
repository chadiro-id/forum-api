class DeleteComent {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { threadId, commentId, owner } = payload;

    if (!threadId || !commentId || !owner) {
      throw new Error('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComent;