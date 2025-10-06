const AuthenticationsUseCase = require('../../../../Applications/use_case/AuthenticationsUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
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

  async putAuthenticationHandler(request) {
    const useCase = this._container.getInstance(AuthenticationsUseCase.name);

    const accessToken = await useCase.refreshAuthentication(request.payload);
    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    const useCase = this._container.getInstance(AuthenticationsUseCase.name);

    await useCase.deauthenticate(request.payload);

    return {
      status: 'success',
    };
  }
}

module.exports = AuthenticationsHandler;