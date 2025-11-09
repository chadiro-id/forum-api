const AuthCredentialsPayload = require('../../../Domains/authentications/entities/AuthCredentialsPayload');
const AuthRefreshPayload = require('../../../Domains/authentications/entities/AuthRefreshPayload');

class PutAuthenticationUseCase {
  constructor({
    authenticationRepository,
    authenticationTokenManager,
  }) {
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(payload) {
    const { refreshToken } = new AuthRefreshPayload(payload);

    const { isValid } = await this._authenticationTokenManager.verifyRefreshToken(refreshToken);
    if (!isValid) {
      throw new Error('PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_VALID');
    }

    const isTokenExist = await this._authenticationRepository.isTokenExist(refreshToken);
    if (!isTokenExist) {
      throw new Error('PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND');
    }

    const decodedPayload = await this._authenticationTokenManager.decodePayload(refreshToken);

    const authCredentials = new AuthCredentialsPayload(decodedPayload);
    return this._authenticationTokenManager.createAccessToken(authCredentials);
  }
}

module.exports = PutAuthenticationUseCase;