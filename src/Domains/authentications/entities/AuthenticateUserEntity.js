class AuthenticateUserEntity {
  constructor(payload) {
    this._verifyPayload(payload);

    this.username = payload.username;
    this.password = payload.password;
  }

  _verifyPayload(payload) {
    const { username, password } = payload;

    if (!username || !password) {
      throw new Error('AUTHENTICATE_USER_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = AuthenticateUserEntity;