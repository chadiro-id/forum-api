class AuthRefreshPayload {
  constructor(payload) {
    this.refreshToken = payload.refreshToken;
  }
}

module.exports = AuthRefreshPayload;