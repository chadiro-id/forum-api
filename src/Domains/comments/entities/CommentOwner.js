class CommentOwner {
  constructor(payload) {
    this._verifyPayload(payload);

    this.owner = payload.owner;
  }

  _verifyPayload({ owner }) {
    if (!owner) {
      throw new Error('COMMENT_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string') {
      throw new Error('COMMENT_OWNER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentOwner;