const UserLogin = require('../../../Domains/authentications/entities/UserLogin');
const UserAuthentication = require('../../../Domains/authentications/entities/UserAuthentication');
const AuthCredentialsPayload = require('../../../Domains/authentications/entities/AuthCredentialsPayload');

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

    const [userId, userPassword] = await Promise.all([
      this._userRepository.getIdByUsername(username),
      this._userRepository.getPasswordByUsername(username),
    ]);

    if (userId === null || userPassword === null) {
      throw new Error('ADD_AUTHENTICATION_USE_CASE.USER_NOT_FOUND');
    }

    const { id } = userId;
    const { password: encryptedPassword } = userPassword;

    const isPasswordMatch = await this._passwordHash.comparePassword(password, encryptedPassword);
    if (!isPasswordMatch) {
      throw new Error('ADD_AUTHENTICATION_USE_CASE.PASSWORD_NOT_MATCH');
    }

    const authCredentials = new AuthCredentialsPayload({ id, username });
    const accessToken = await this._authenticationTokenManager.createAccessToken(authCredentials);
    const refreshToken = await this._authenticationTokenManager.createRefreshToken(authCredentials);

    const userAuthentication = new UserAuthentication({ accessToken, refreshToken });
    await this._authenticationRepository.addToken(userAuthentication.refreshToken);

    return userAuthentication;
  }
}

module.exports = AddAuthenticationUseCase;