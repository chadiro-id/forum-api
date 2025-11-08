class ReplyOwner {
  constructor(payload) {
    this._verifyPayload(payload);

    this.owner = payload.owner;
  }

  _verifyPayload({ owner }) {
    if (!owner) {
      throw new Error('REPLY_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = ReplyOwner;