const AuthRefreshPayload = require('../../../Domains/authentications/entities/AuthRefreshPayload');

class DeleteAuthenticationUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute(payload) {
    const { refreshToken } = new AuthRefreshPayload(payload);

    const isTokenExist = await this._authenticationRepository.isTokenExist(refreshToken);
    if (!isTokenExist) {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND');
    }

    await this._authenticationRepository.deleteToken(refreshToken);
  }
}

module.exports = DeleteAuthenticationUseCase;