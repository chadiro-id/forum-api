class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.commentId = payload.commentId;
    this.content = payload.content;
    this.ownerId = payload.ownerId;
  }

  _verifyPayload(payload) {
    const { commentId, content, ownerId } = payload;

    if (!commentId || !content || !ownerId) {
      throw new Error('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = NewReply;