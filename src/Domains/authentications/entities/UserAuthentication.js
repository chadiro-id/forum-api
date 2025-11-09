class UserAuthentication {
  /**
   * User Authentication constructor
   * @param {Object} payload
   * @property {string} accessToken
   * @property {string} refreshToken
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.accessToken = payload.accessToken;
    this.refreshToken = payload.refreshToken;
  }

  _verifyPayload(payload) {
    const { accessToken, refreshToken } = payload;

    if (!accessToken || !refreshToken) {
      throw new Error('USER_AUTHENTICATION.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new Error('USER_AUTHENTICATION.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (refreshToken === accessToken) {
      throw new Error('USER_AUTHENTICATION.REFRESH_TOKEN_EQUAL_TO_ACCESS_TOKEN');
    }
  }
}

module.exports = UserAuthentication;