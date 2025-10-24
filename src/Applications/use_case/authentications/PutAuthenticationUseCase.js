const AuthenticationPayload = require('../../../Domains/authentications/entities/AuthenticationPayload');

class PutAuthenticationUseCase {
  constructor({
    authenticationRepository,
    authenticationTokenManager,
  }) {
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(payload) {
    this._verifyPayload(payload);

    const { refreshToken } = payload;

    await this._authenticationTokenManager.verifyRefreshToken(refreshToken);
    await this._authenticationRepository.verifyTokenExists(refreshToken);

    const { username, id } = await this._authenticationTokenManager.decodePayload(refreshToken);

    const authenticationPayload = new AuthenticationPayload({ id, username });
    return this._authenticationTokenManager.createAccessToken(authenticationPayload);
  }

  _verifyPayload(payload) {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new Error('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PutAuthenticationUseCase;