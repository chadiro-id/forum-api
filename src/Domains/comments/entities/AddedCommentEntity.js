class AddedCommentEntity {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { id, content, owner } = payload;

    if (!id || !content || !owner) {
      throw new Error('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = AddedCommentEntity;