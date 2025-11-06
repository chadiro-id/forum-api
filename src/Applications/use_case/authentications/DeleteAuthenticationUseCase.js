class DeleteAuthenticationUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute(payload) {
    this._verifyPayload(payload);

    const { refreshToken } = payload;

    const isTokenExist = await this._authenticationRepository.isTokenExist(refreshToken);
    if (!isTokenExist) {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND');
    }

    await this._authenticationRepository.deleteToken(refreshToken);
  }

  _verifyPayload(payload) {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteAuthenticationUseCase;