const AuthenticateUserEntity = require('../../Domains/authentications/entities/AuthenticateUserEntity');
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

  async authenticateUser(payload) {
    const { username, password } = new AuthenticateUserEntity(payload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);
    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken = await this._authenticationTokenManager.createAccessToken({ username, id });
    const refreshToken = await this._authenticationTokenManager.createRefreshToken({ username, id });

    const authenticationEntity = new NewAuthEntity({ accessToken, refreshToken });
    await this._authenticationRepository.addToken(authenticationEntity.refreshToken);

    return authenticationEntity;
  }
}

module.exports = AuthenticationsUseCase;