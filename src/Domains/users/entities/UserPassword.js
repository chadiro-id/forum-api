class UserPassword {
  /**
   * User Password constructor
   * @param {Object} payload
   * @property {string} password
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.password = payload.password;
  }

  _verifyPayload({ password }) {
    if (!password) {
      throw new Error('USER_PASSWORD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof password !== 'string') {
      throw new Error('USER_PASSWORD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = UserPassword;