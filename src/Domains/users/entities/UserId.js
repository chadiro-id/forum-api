class UserId {
  /**
   * User Id constructor
   * @param {Object} payload
   * @property {string} id
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
  }

  _verifyPayload({ id }) {
    if (!id) {
      throw new Error('USER_ID.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string') {
      throw new Error('USER_ID.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = UserId;