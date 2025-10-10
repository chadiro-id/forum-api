class AddCommentEntity {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { threadId, content, ownerId } = payload;

    if (!threadId || !content || !ownerId) {
      throw new Error('ADD_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof content !== 'string' || typeof ownerId !== 'string') {
      throw new Error('ADD_COMMENT_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddCommentEntity;