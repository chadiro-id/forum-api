const UserLoginEntity = require('../../Domains/authentications/entities/UserLoginEntity');
const NewAuthEntity = require('../../Domains/authentications/entities/NewAuthEntity');

class AuthenticationsUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    passwordHash
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._passwordHash = passwordHash;
  }

  async authenticate(payload) {
    const { username, password } = new UserLoginEntity(payload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);
    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken = await this._authenticationTokenManager.createAccessToken({ username, id });
    const refreshToken = await this._authenticationTokenManager.createRefreshToken({ username, id });

    const authenticationEntity = new NewAuthEntity({ accessToken, refreshToken });
    await this._authenticationRepository.addToken(authenticationEntity.refreshToken);

    return authenticationEntity;
  }

  async refreshAuthentication(payload) {
    const token = this._verifyRefreshToken(payload);

    await this._authenticationTokenManager.verifyRefreshToken(token);
    await this._authenticationRepository.checkAvailabilityToken(token);

    const { username, id } = await this._authenticationTokenManager.decodePayload(token);

    return this._authenticationTokenManager.createAccessToken({ username, id });
  }

  async deauthenticate(payload) {
    const token = this._verifyRefreshToken(payload);

    await this._authenticationRepository.checkAvailabilityToken(token);
    await this._authenticationRepository.deleteToken(token);
  }

  _verifyRefreshToken(payload) {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new Error('AUTHENTICATIONS_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('AUTHENTICATIONS_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    return refreshToken;
  }
}

module.exports = AuthenticationsUseCase;