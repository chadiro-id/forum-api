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

    const [id, encryptedPassword] = await Promise.all([
      this._userRepository.getIdByUsername(username),
      this._userRepository.getPasswordByUsername(username),
    ]);

    if (!id || !encryptedPassword) {
      throw new Error('ADD_AUTHENTICATION_USE_CASE.USER_NOT_FOUND');
    }

    const isPasswordMatch = await this._passwordHash.comparePassword(password, encryptedPassword);
    if (!isPasswordMatch) {
      throw new Error('ADD_AUTHENTICATION_USE_CASE.PASSWORD_NOT_MATCH');
    }

    const authenticationPayload = new AuthenticationPayload({ id, username });
    const accessToken = await this._authenticationTokenManager.createAccessToken(authenticationPayload);
    const refreshToken = await this._authenticationTokenManager.createRefreshToken(authenticationPayload);

    const userAuthentication = new UserAuthentication({ accessToken, refreshToken });
    await this._authenticationRepository.addToken(userAuthentication.refreshToken);

    return userAuthentication;
  }
}

module.exports = AddAuthenticationUseCase;