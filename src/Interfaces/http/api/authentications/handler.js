const AuthenticationsUseCase = require('../../../../Applications/use_case/AuthenticationsUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;
  }

  async postAuthenticationHandler(request, h) {
    const useCase = this._container.getInstance(AuthenticationsUseCase.name);

    const { accessToken, refreshToken } = await useCase.authenticate(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = AuthenticationsHandler;