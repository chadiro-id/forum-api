class ReplyOwner {
  /**
   * Reply Owner Entity constructor
   * @param {Object} payload
   * @property {string} owner
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.owner = payload.owner;
  }

  _verifyPayload({ owner }) {
    if (!owner) {
      throw new Error('REPLY_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string') {
      throw new Error('REPLY_OWNER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyOwner;