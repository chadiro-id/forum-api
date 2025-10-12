class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { threadId, content, owner } = payload;

    if (!threadId || !content || !owner) {
      throw new Error('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof content !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;