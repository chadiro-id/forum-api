class AuthRefreshPayload {
  constructor(payload) {
    this._verifyPayload(payload);

    this.refreshToken = payload.refreshToken;
  }

  _verifyPayload({ refreshToken }) {
    if (!refreshToken) {
      throw new Error('AUTH_REFRESH_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('AUTH_REFRESH_PAYLOAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AuthRefreshPayload;