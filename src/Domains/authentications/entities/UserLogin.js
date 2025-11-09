class UserLogin {
  /**
   * User Login Entity constructor
   * @param {Object} payload
   * @property {string} username
   * @property {string} password
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.username = payload.username;
    this.password = payload.password;
  }

  _verifyPayload(payload) {
    const { username, password } = payload;

    if (!username || !password) {
      throw new Error('USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('USER_LOGIN.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = UserLogin;