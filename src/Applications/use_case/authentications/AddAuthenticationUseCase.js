const UserLogin = require('../../../Domains/authentications/entities/UserLogin');
const UserAuthentication = require('../../../Domains/authentications/entities/UserAuthentication');
const AuthenticationPayload = require('../../../Domains/authentications/entities/AuthenticationPayload');

class AddAuthenticationUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(payload) {
    const { username, password } = new UserLogin(payload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);
    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const authenticationPayload = new AuthenticationPayload({ id, username });
    const accessToken = await this._authenticationTokenManager.createAccessToken(authenticationPayload);
    const refreshToken = await this._authenticationTokenManager.createRefreshToken(authenticationPayload);

    const userAuthentication = new UserAuthentication({ accessToken, refreshToken });
    await this._authenticationRepository.addToken(userAuthentication.refreshToken);

    return userAuthentication;
  }
}

module.exports = AddAuthenticationUseCase;